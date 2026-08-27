module TraditionalKnowledgeTemporaryDeployment
  class StateStore
    attr_reader :directory

    def initialize(
      directory = ENV.fetch(
        "TEMPORARY_DEPLOYMENT_STATE_DIRECTORY",
        DEFAULT_STATE_DIR
      )
    )
      @directory = File.expand_path(directory)
    end

    def save(state)
      FileUtils.mkdir_p(directory, mode: 0o700)
      path = path_for(state.fetch("environment_id"))
      Tempfile.create(%w[temporary- .json], directory, mode: 0o600) do |file|
        file.write(JSON.pretty_generate(state))
        file.flush
        File.rename(file.path, path)
      end
    end

    def find(environment_id)
      path = path_for(environment_id)
      return unless File.file?(path)

      JSON.parse(File.read(path))
    rescue JSON::ParserError => error
      raise Error,
            "Invalid temporary deployment state at #{path}: #{error.message}"
    end

    def all
      return [] unless Dir.exist?(directory)

      Dir
        .glob(File.join(directory, "*.json"))
        .sort
        .filter_map do |path|
          JSON.parse(File.read(path))
        rescue JSON::ParserError => error
          raise Error,
                "Invalid temporary deployment state at #{path}: #{error.message}"
        end
    end

    def delete(environment_id)
      File.delete(path_for(environment_id))
    rescue Errno::ENOENT
      nil
    end

    private

    def path_for(environment_id)
      unless environment_id.match?(
               /\A(?:pr-\d+|branch-[a-z0-9-]+|sha-[0-9a-f]{12})\z/
             )
        raise Error, "Invalid temporary deployment identifier"
      end

      File.join(directory, "#{environment_id}.json")
    end
  end
end
