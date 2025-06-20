import { audioManager } from "./audio";

export const notifications = {
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  },

  show(title: string, options?: NotificationOptions): void {
    if (Notification.permission === "granted") {
      new Notification(title, {
        icon: "/favicon.ico",
        ...options,
      });
    }
  },

  showSessionStart(): void {
    this.show("Focus Session Started! 🎯", {
      body: "Your focus session has begun. Stay concentrated!",
      tag: "session-start",
    });
    audioManager.playSessionStart();
  },

  showBreakStart(breakDuration: number): void {
    this.show("Break Time! 🧘", {
      body: `Take a ${breakDuration}-minute break. You've earned it!`,
      tag: "break-start",
    });
    audioManager.playBreakStart();
  },

  showBreakEnd(): void {
    this.show("Break's Over! 💪", {
      body: "Time to get back to work. You've got this!",
      tag: "break-end",
    });
    audioManager.playBreakFinish();
  },

  showSessionComplete(): void {
    this.show("Session Complete! 🎉", {
      body: "Great job! You've completed your focus session.",
      tag: "session-complete",
    });
    audioManager.playSessionFinish();
  },

  showPreparationComplete(): void {
    this.show("Ready to Focus! 🎯", {
      body: "Preparation time is over. Let's start your focus session!",
      tag: "preparation-complete",
    });
    audioManager.playSessionStart();
  },
};
