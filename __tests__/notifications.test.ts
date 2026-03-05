import { TEST_NOTIFICATION_COPY } from "@/core/constants";
import { buildTestNotificationPayload } from "@/core/scheduleUtils";

describe("test notification", () => {
  it("uses fixed copy and does not rely on quote content", () => {
    expect(buildTestNotificationPayload()).toEqual({
      content: {
        title: TEST_NOTIFICATION_COPY.title,
        body: TEST_NOTIFICATION_COPY.body,
        sound: false,
      },
      trigger: null,
    });
  });
});
