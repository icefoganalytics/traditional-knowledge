require "minitest/autorun"
require "socket"
require "tmpdir"

load File.join(__dir__, "dev")

class DevHelperPortTest < Minitest::Test
  class TestHelper < DevHelper
    attr_accessor :compose_stack_running, :gateway_stack_present, :gateway_stack_running

    attr_reader :compose_call

    def initialize(project_root)
      @test_project_root = project_root
      @gateway_stack_present = false
      @compose_stack_running = false
    end

    def compose(*args, **kwargs)
      @compose_call = [args, kwargs]
    end

    private

    def project_root
      @test_project_root
    end

    def compose_project_running?
      @compose_stack_running
    end

    def gateway_routed_stack_present?
      @gateway_stack_present
    end

    def gateway_routed_stack_running?
      @gateway_stack_running
    end

    def local_gateway_running?
      false
    end
  end

  def test_dev_up_generates_reuses_and_replaces_ports_and_passes_generated_file
    Dir.mktmpdir do |project_root|
      helper = TestHelper.new(project_root)
      port_file = File.join(project_root, DevHelper::PORT_ENVIRONMENT_FILE)

      OpenInEditorBridge.stub(:with_running, ->(**, &block) { block.call }) do
        helper.up("--dry-run")
        first_configuration = File.binread(port_file)
        first_environment = read_environment(port_file)

        assert_unique_ports(first_environment)
        assert_equal(
          "port-#{first_environment.fetch("WEB_PORT")}#{DevHelper::WEB_HOSTNAME_SUFFIX}",
          first_environment.fetch("WEB_HOSTNAME"),
        )
        assert_equal ["up", "--remove-orphans", "--force-recreate", "--dry-run"], helper.compose_call.first

        helper.up("--dry-run")
        assert_equal first_configuration, File.binread(port_file)

        helper.gateway_stack_present = true
        helper.gateway_stack_running = true
        helper.up("--dry-run")
        assert_equal first_configuration, File.binread(port_file)

        helper.gateway_stack_running = false
        helper.compose_stack_running = true
        occupied_backend_port = TCPServer.new("127.0.0.1", Integer(first_environment.fetch("BACKEND_PORT"), 10))
        helper.up("--dry-run")
        assert_equal first_configuration, File.binread(port_file)
        occupied_backend_port.close
        helper.compose_stack_running = false
        occupied_backend_port = TCPServer.new("127.0.0.1", Integer(first_environment.fetch("BACKEND_PORT"), 10))
        helper.up("--dry-run")
        gateway_stopped_configuration = File.binread(port_file)
        refute_equal first_configuration, gateway_stopped_configuration
        occupied_backend_port.close

        helper.gateway_stack_present = false
        gateway_stopped_environment = read_environment(port_file)
        occupied_web_port = TCPServer.new("127.0.0.1", Integer(gateway_stopped_environment.fetch("WEB_PORT"), 10))
        helper.up("--dry-run")
        refute_equal gateway_stopped_configuration, File.binread(port_file)
      ensure
        occupied_backend_port&.close
        occupied_web_port&.close
      end

      compose_command = helper.send(:compose_command, "config")
      assert_includes compose_command, "--env-file #{port_file}"
      assert_includes compose_command, "env -u BACKEND_PORT"
    end
  end

  private

  def read_environment(port_file)
    File.readlines(port_file, chomp: true).to_h { |line| line.split("=", 2) }
  end

  def assert_unique_ports(environment)
    ports = DevHelper::GENERATED_PORT_ENVIRONMENT_KEYS.map { |key| Integer(environment.fetch(key), 10) }
    assert_equal ports.length, ports.uniq.length
    assert ports.all?(&:positive?)
  end
end
