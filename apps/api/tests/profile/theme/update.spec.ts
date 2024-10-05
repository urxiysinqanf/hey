import axios from "axios";
import { TEST_URL } from "tests/helpers/constants";
import getTestAuthHeaders from "tests/helpers/getTestAuthHeaders";
import { describe, expect, test } from "vitest";

describe("POST /profile/theme/update", () => {
  test("should return 400 if no body is provided", async () => {
    try {
      await axios.post(
        `${TEST_URL}/profile/theme/update`,
        {},
        { headers: getTestAuthHeaders("pro") }
      );
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  test("should return 400 for invalid body (missing required fields)", async () => {
    try {
      await axios.post(
        `${TEST_URL}/profile/theme/update`,
        { randomField: "invalid" },
        { headers: getTestAuthHeaders("pro") }
      );
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  test("should return 200 and update the profile theme as a pro user", async () => {
    const { data, status } = await axios.post(
      `${TEST_URL}/profile/theme/update`,
      { overviewFontStyle: "archivo", publicationFontStyle: "archivoNarrow" },
      { headers: getTestAuthHeaders("pro") }
    );

    expect(status).toBe(200);
    expect(data.result).toBeDefined();
    expect(data.result.overviewFontStyle).toBe("archivo");
    expect(data.result.publicationFontStyle).toBe("archivoNarrow");
  });

  test("should return 401 for a normal user", async () => {
    try {
      await axios.post(
        `${TEST_URL}/profile/theme/update`,
        { overviewFontStyle: "archivo", publicationFontStyle: "archivoNarrow" },
        { headers: getTestAuthHeaders() }
      );
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});