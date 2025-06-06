import { useState, useEffect } from "react";
import { SessionRecord } from "@shared/schema";
import { storage } from "@/lib/storage";

export function useSessions() {
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecords = () => {
      try {
        const storedRecords = storage.getRecords();
        setRecords(storedRecords);
      } catch (error) {
        console.error("Failed to load session records:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  const addRecord = (record: Omit<SessionRecord, "id">) => {
    try {
      const newRecord = storage.addRecord(record);
      setRecords(prev => [...prev, newRecord]);
      return newRecord;
    } catch (error) {
      console.error("Failed to add session record:", error);
      throw error;
    }
  };

  const getStats = () => {
    return storage.getTodaysStats();
  };

  return {
    records,
    addRecord,
    getStats,
    isLoading,
  };
}
