import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

vi.mock("quasar", () => ({ Notify: { create: vi.fn() } }));
vi.mock("@/services/ApiClient", () => ({
  apiPushTrench: vi.fn(),
  apiUploadAttachment: vi.fn(),
}));
vi.mock("@/services/indexedDbManager", () => ({
  openDB: vi.fn(async () => ({})),
  readDataInIndexedDB: vi.fn(),
  getPendingAttachment: vi.fn(),
  deletePendingAttachment: vi.fn(),
  storeDataInIndexedDB: vi.fn(),
}));

import { Notify } from "quasar";
import { apiPushTrench } from "@/services/ApiClient";
import { readDataInIndexedDB } from "@/services/indexedDbManager";
import { pushSurvey } from "@/services/pushSurveyService";

const archived = {
  IdentifierUUID: "A",
  Identifier: "FK1",
  RightsStatus: "Archived",
  Title: "old",
  Trench: "T1",
};

function push(surveys) {
  return pushSurvey({
    trenchName: "T1",
    trenchVersion: "v1",
    trenchSurvey: surveys,
    projectPreferencesBase64: "",
  });
}

describe("pushSurvey and archived items", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    readDataInIndexedDB.mockResolvedValue(JSON.stringify([archived]));
  });

  it("does not send a push that modifies an archived item", async () => {
    expect(await push([{ ...archived, Title: "new" }])).toBeNull();

    expect(apiPushTrench).not.toHaveBeenCalled();
    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "negative",
        message: expect.stringContaining("FK1"),
      }),
    );
  });

  it("pushes when archived items are untouched", async () => {
    apiPushTrench.mockResolvedValue({ data: { status: "ok", version: "v1" } });

    await push([archived, { IdentifierUUID: "B", Title: "new", Trench: "T1" }]);

    expect(apiPushTrench).toHaveBeenCalledTimes(1);
    expect(apiPushTrench.mock.calls[0][2][0]).not.toHaveProperty("Trench");
  });

  it("reports archived items rejected by the server", async () => {
    // e.g. archived on the server by someone else since the last sync
    readDataInIndexedDB.mockResolvedValue(null);
    apiPushTrench.mockRejectedValue({
      response: { status: 409, data: { archived: ["A"] } },
    });

    expect(await push([{ ...archived, Title: "new" }])).toBeNull();
    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("FK1") }),
    );
  });
});
