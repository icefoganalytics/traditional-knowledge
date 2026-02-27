import objectValueDecoder from "@/utils/object-value-decoder"

describe("api/src/utils/object-value-decoder.ts", () => {
  describe(".objectValueDecoder", () => {
    test("when given a simple object with string booleans, converts them to actual booleans", () => {
      // Arrange
      const object = {
        active: "true",
        visible: "false",
        name: "test",
      }

      // Act
      const result = objectValueDecoder(object)

      // Assert
      expect(result).toEqual({
        active: true,
        visible: false,
        name: "test",
      })
    })

    test("when given a nested object with string booleans, converts them recursively", () => {
      // Arrange
      const object = {
        user: {
          active: "true",
          profile: {
            visible: "false",
            verified: "true",
          },
        },
        name: "test",
      }

      // Act
      const result = objectValueDecoder(object)

      // Assert
      expect(result).toEqual({
        user: {
          active: true,
          profile: {
            visible: false,
            verified: true,
          },
        },
        name: "test",
      })
    })

    test("when given an array with string booleans, converts them recursively", () => {
      // Arrange
      const object = {
        categories: [
          {
            active: "true",
            name: "Category 1",
          },
          {
            active: "false",
            name: "Category 2",
          },
        ],
      }

      // Act
      const result = objectValueDecoder(object)

      // Assert
      expect(result).toEqual({
        categories: [
          {
            active: true,
            name: "Category 1",
          },
          {
            active: false,
            name: "Category 2",
          },
        ],
      })
    })

    test("when given mixed types, preserves non-string values", () => {
      // Arrange
      const object = {
        active: "true",
        count: 42,
        enabled: false,
        name: "test",
        items: [],
        metadata: null,
      }

      // Act
      const result = objectValueDecoder(object)

      // Assert
      expect(result).toEqual({
        active: true,
        count: 42,
        enabled: false,
        name: "test",
        items: [],
        metadata: null,
      })
    })

    test("when given boolean-like strings that are not exact matches, preserves them", () => {
      // Arrange
      const object = {
        truthy: "True",
        falsy: "False",
        maybe: "TRUE",
        perhaps: "FALSE",
        notBoolean: "yes",
      }

      // Act
      const result = objectValueDecoder(object)

      // Assert
      expect(result).toEqual({
        truthy: "True",
        falsy: "False",
        maybe: "TRUE",
        perhaps: "FALSE",
        notBoolean: "yes",
      })
    })

    test("when given an empty object, returns an empty object", () => {
      // Arrange
      const object = {}

      // Act
      const result = objectValueDecoder(object)

      // Assert
      expect(result).toEqual({})
    })

    test("when given null, returns null", () => {
      // Arrange
      const object = null

      // Act & Assert
      expect(() => objectValueDecoder(object)).not.toThrow()
    })
  })
})
