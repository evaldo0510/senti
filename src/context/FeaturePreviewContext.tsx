import React, { createContext, useContext, useState } from "react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: any;
}

interface FeaturePreviewContextProps {
  isOpen: boolean;
  currentFeature: Feature | null;
  openPreview: (feature: Feature) => void;
  triggerPreview: (feature: Feature) => void;
  closePreview: () => void;
  subscribedFeatures: Record<string, boolean>;
  toggleSubscription: (id: string) => void;
}

const FeaturePreviewContext = createContext<FeaturePreviewContextProps | undefined>(undefined);

export const FeaturePreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null);
  const [subscribedFeatures, setSubscribedFeatures] = useState<Record<string, boolean>>({});

  const openPreview = (feature: Feature) => {
    setCurrentFeature(feature);
    setIsOpen(true);
  };

  const triggerPreview = (feature: Feature) => {
    setCurrentFeature(feature);
    setIsOpen(true);
  };

  const closePreview = () => {
    setIsOpen(false);
  };

  const toggleSubscription = (id: string) => {
    setSubscribedFeatures((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <FeaturePreviewContext.Provider
      value={{
        isOpen,
        currentFeature,
        openPreview,
        triggerPreview,
        closePreview,
        subscribedFeatures,
        toggleSubscription,
      }}
    >
      {children}
    </FeaturePreviewContext.Provider>
  );
};

export const useFeaturePreview = () => {
  const context = useContext(FeaturePreviewContext);
  if (!context) {
    throw new Error("useFeaturePreview must be used within a FeaturePreviewProvider");
  }
  return context;
};
