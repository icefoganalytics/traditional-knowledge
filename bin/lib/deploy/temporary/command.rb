module TraditionalKnowledgeTemporaryDeployment
  ACTIONS = %w[up list status logs down].freeze

  def self.run(argv)
    command = argv.shift
    return puts(help) if command.nil? || %w[help --help -h].include?(command)
    unless %w[temporary ephemeral].include?(command)
      raise Error, "Unknown deploy target: #{command}"
    end

    run_temporary(argv)
  rescue OptionParser::ParseError, ArgumentError, Error => error
    warn error.message
    exit 1
  end

  def self.run_temporary(argv)
    action = ACTIONS.include?(argv.first) ? argv.shift : "up"
    options = {
      ttl_hours: 4,
      follow: false,
      all: false,
      expired: false,
      yes: false,
      sources: []
    }
    parser =
      OptionParser.new do |option_parser|
        option_parser.banner =
          "Usage: bin/deploy temporary [up|list|status|logs|down] [source] [options]"
        option_parser.on("--pr NUMBER", "Pull request number") do |value|
          options[:sources] << [:pr, value]
        end
        option_parser.on("--branch NAME", "Git branch name") do |value|
          options[:sources] << [:branch, value]
        end
        option_parser.on("--git-hash SHA", "Full git commit SHA") do |value|
          options[:sources] << [:git_hash, value]
        end
        option_parser.on(
          "--ttl-hours HOURS",
          Integer,
          "Environment lifetime (default: 4)"
        ) { |value| options[:ttl_hours] = value }
        option_parser.on("--follow", "Follow logs") { options[:follow] = true }
        option_parser.on("--all", "Operate on all tracked environments") do
          options[:all] = true
        end
        option_parser.on(
          "--expired",
          "With --all, operate only on expired environments"
        ) { options[:expired] = true }
        option_parser.on("--yes", "Confirm a destructive --all operation") do
          options[:yes] = true
        end
        option_parser.on("--help", "Show help") do
          puts option_parser
          exit
        end
      end
    parser.parse!(argv)
    raise Error, "Unexpected argument(s): #{argv.join(" ")}" unless argv.empty?
    unless options[:ttl_hours].positive?
      raise Error, "--ttl-hours must be positive"
    end

    application = Application.new
    if options[:sources].length > 1
      raise Error, "Choose exactly one source selector"
    end
    source = options[:sources].first && Source.parse(*options[:sources].first)
    if options[:all] && source
      raise Error, "--all cannot be combined with a source selector"
    end
    case action
    when "up"
      unless source
        raise Error, "temporary requires --pr, --branch, or --git-hash"
      end
      application.up(source, options[:ttl_hours])
    when "list"
      application.list
    when "status"
      raise Error, "status requires --pr, --branch, or --git-hash" unless source
      application.status(source)
    when "logs"
      raise Error, "logs requires --pr, --branch, or --git-hash" unless source
      application.logs(source, options[:follow])
    when "down"
      unless source || options[:all]
        raise Error, "down requires a source or --all"
      end
      application.down(
        source,
        all: options[:all],
        expired: options[:expired],
        confirmed: options[:yes]
      )
    end
  end

  def self.help
    <<~HELP
      Deploy disposable public environments for Traditional Knowledge.

      Usage:
        bin/deploy temporary --pr NUMBER [--ttl-hours HOURS]
        bin/deploy temporary --branch NAME [--ttl-hours HOURS]
        bin/deploy temporary --git-hash SHA [--ttl-hours HOURS]
        bin/deploy temporary status --pr NUMBER
        bin/deploy temporary status --branch NAME
        bin/deploy temporary status --git-hash SHA
        bin/deploy temporary logs --pr NUMBER [--follow]
        bin/deploy temporary logs --branch NAME [--follow]
        bin/deploy temporary logs --git-hash SHA [--follow]
        bin/deploy temporary down --pr NUMBER
        bin/deploy temporary down --branch NAME
        bin/deploy temporary down --git-hash SHA
        bin/deploy temporary down --all --expired --yes

      `ephemeral` is an alias for `temporary`. Configure TK_TEMPORARY_* values
      for a non-production Azure Container Apps environment.
    HELP
  end
end
