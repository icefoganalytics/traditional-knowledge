module TraditionalKnowledgeTemporaryDeployment
  class Source
    KINDS = %i[pr branch git_hash].freeze

    attr_reader :kind, :value

    def self.parse(kind, value)
      normalized_kind = kind.to_s.tr("-", "_").to_sym
      unless KINDS.include?(normalized_kind)
        raise Error, "Source must be a PR, branch, or git hash"
      end

      new(normalized_kind, value)
    end

    def initialize(kind, value)
      @kind = kind
      @value = value.to_s.strip
      validate!
    end

    def identifier
      case kind
      when :pr
        "pr-#{Integer(value, 10)}"
      when :branch
        "branch-#{slug}-#{Digest::SHA256.hexdigest(value)[0, 8]}"
      when :git_hash
        "sha-#{value[0, 12]}"
      end
    end

    def label
      "#{kind}:#{value}"
    end

    def app_identifier
      case kind
      when :pr
        "pr-#{Integer(value, 10)}"
      when :branch
        "branch-#{Digest::SHA256.hexdigest(value)[0, 10]}"
      when :git_hash
        "sha-#{value[0, 12]}"
      end
    end

    def slug
      result =
        value.downcase.gsub(/[^a-z0-9]+/, "-").sub(/\A-+/, "").sub(/-+\z/, "")[
          0,
          24
        ]
      result.empty? ? "branch" : result
    end

    def validate!
      case kind
      when :pr
        unless value.match?(/\A[1-9]\d*\z/)
          raise Error, "PR number must be positive"
        end
      when :branch
        raise Error, "Branch must not be empty" if value.empty?
        unless value.match?(%r{\A[\w./-]+\z})
          raise Error, "Branch contains unsupported characters"
        end
      when :git_hash
        unless value.match?(/\A[0-9a-f]{40}\z/i)
          raise Error, "Git hash must be a full 40-character SHA"
        end
      end
    end
  end
end
