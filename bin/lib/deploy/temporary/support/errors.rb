module TraditionalKnowledgeTemporaryDeployment
  class Error < StandardError
  end

  class CommandError < Error
    attr_reader :command, :output

    def initialize(command, output)
      @command = command
      @output = output
      super("Command failed (#{command.join(" ")}):\n#{output}")
    end
  end

  class Runner
    def run(*command)
      run_with_environment({}, *command)
    end

    def run_with_environment(environment, *command)
      stdout, stderr, status =
        Open3.capture3(
          { "TK_TEMPORARY_AUTH0_MANAGEMENT_TOKEN" => nil }.merge(environment),
          *command
        )
      output = [stdout, stderr].reject(&:empty?).join
      raise CommandError.new(command, output) unless status.success?

      stdout
    end
    def stream(*command)
      unless system({ "TK_TEMPORARY_AUTH0_MANAGEMENT_TOKEN" => nil }, *command)
        raise Error, "Command failed (#{command.join(" ")})"
      end
    end
  end
end
