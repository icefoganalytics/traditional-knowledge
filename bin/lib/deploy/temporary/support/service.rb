module TraditionalKnowledgeTemporaryDeployment
  class Service
    def self.call(*arguments, **keyword_arguments)
      new(*arguments, **keyword_arguments).call
    end
  end
end
