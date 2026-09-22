module TraditionalKnowledgeTemporaryDeployment
  class Worktree
    def initialize(runner, root)
      @runner = runner
      @root = root
    end

    def with(sha)
      Dir.mktmpdir("tk-temporary-build-") do |path|
        @runner.run(
          "git",
          "-C",
          @root,
          "worktree",
          "add",
          "--detach",
          path,
          sha
        )
        begin
          yield path
        ensure
          @runner.run("git", "-C", @root, "worktree", "remove", "--force", path)
        end
      end
    end
  end
end
