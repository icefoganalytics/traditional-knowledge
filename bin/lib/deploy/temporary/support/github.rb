module TraditionalKnowledgeTemporaryDeployment
  class GitHub
    def initialize(runner, repository)
      @runner = runner
      @repository = repository
    end

    def commit(source)
      case source.kind
      when :pr
        pull_request(source.value).fetch("headSha")
      when :branch
        @runner.run(
          "gh",
          "api",
          "repos/#{@repository}/commits/#{source.value}",
          "--jq",
          ".sha"
        ).strip
      when :git_hash
        source.value
      end
    end

    def pull_request(number)
      result =
        @runner.run(
          "gh",
          "pr",
          "view",
          Integer(number).to_s,
          "--repo",
          @repository,
          "--json",
          "headRefName,headSha"
        )
      JSON.parse(result).transform_keys(&:to_s)
    rescue JSON::ParserError => error
      raise Error, "Unable to read PR metadata: #{error.message}"
    end

    def fetch_commit(source, sha, root)
      ref = "refs/tk-temporary/#{source.identifier}"
      remote_ref =
        source.kind == :pr ?
          "refs/pull/#{source.value}/head" :
          source.kind == :branch ? "refs/heads/#{source.value}" : sha
      @runner.run(
        "git",
        "-C",
        root,
        "fetch",
        "--force",
        "origin",
        "#{remote_ref}:#{ref}"
      )
      fetched_sha = @runner.run("git", "-C", root, "rev-parse", ref).strip
      return ref if fetched_sha == sha

      begin
        @runner.run("git", "-C", root, "update-ref", "-d", ref)
      rescue StandardError
        nil
      end
      raise Error,
            "Fetched #{source.label} commit #{fetched_sha} does not match GitHub SHA #{sha}"
    end

    def remove_commit_ref(ref, root)
      @runner.run("git", "-C", root, "update-ref", "-d", ref)
    end
  end
end
