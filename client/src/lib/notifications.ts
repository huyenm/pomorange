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

  showBreakStart(breakDuration: number): void {
    this.show("Break Time!", {
      body: `Time for a ${breakDuration}-minute break. You've earned it!`,
    });
  },

  showBreakEnd(): void {
    this.show("Break Complete!", {
      body: "Ready to get back to work? Let's start another session.",
    });
  },

  showSessionComplete(): void {
    this.show("Session Complete!", {
      body: "Great work! Have you finished your task?",
    });
  },

  showPreparationComplete(): void {
    this.show("Preparation Time Complete!", {
      body: "Your 10 minutes are up! Click 'Begin Timer' to start your session.",
      icon: "🔔"
    });
  },
};
