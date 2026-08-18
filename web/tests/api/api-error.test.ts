import ApiError from "@/api/api-error"

describe("web/src/api/api-error.ts", () => {
  describe("ApiError", () => {
    beforeEach(() => {
      vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true)
    })

    test.each([
      { status: 403, expected: /don't have permission/ },
      { status: 404, expected: /couldn't find what you were looking for/ },
      { status: 408, expected: /took too long/ },
      { status: 410, expected: /no longer available/ },
      { status: 429, expected: /Too many requests/ },
      { status: 500, expected: /went wrong on our end/ },
      // 502 and 504 read as maintenance to a user, the same as 503.
      { status: 502, expected: /temporarily unavailable/ },
      { status: 503, expected: /temporarily unavailable/ },
      { status: 504, expected: /temporarily unavailable/ },
    ])(
      "when status is $status, replaces the developer-facing server message",
      ({ status, expected }) => {
        // Arrange, Act
        const error = new ApiError("Sequelize validation blew up", status)

        // Assert
        expect(error.message).toMatch(expected)
        expect(error.userMessage).toMatch(expected)
        expect(error.serverMessage).toBe("Sequelize validation blew up")
      }
    )

    test.each([400, 422])(
      "when status is %i, keeps the actionable server message for the user",
      (status) => {
        // Arrange, Act
        const error = new ApiError("Email is required", status)

        // Assert
        expect(error.message).toBe("Email is required")
        expect(error.serverMessage).toBe("Email is required")
      }
    )

    test("when the browser is offline, explains the connection instead of the status", () => {
      // Arrange
      vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false)

      // Act
      const error = new ApiError("Network Error", 500)

      // Assert
      expect(error.message).toMatch(/appear to be offline/)
    })

    test("when status is unrecognized, falls back to the generic message", () => {
      // Arrange, Act
      const error = new ApiError("Teapot", 418)

      // Assert
      expect(error.message).toMatch(/Something went wrong/)
    })
  })
})
