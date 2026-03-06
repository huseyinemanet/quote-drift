import { createContext, useContext } from "react";

const BottomChromeInsetContext = createContext(88);

export function BottomChromeInsetProvider({
  value,
  children,
}: {
  value: number;
  children: React.ReactNode;
}) {
  return (
    <BottomChromeInsetContext.Provider value={value}>
      {children}
    </BottomChromeInsetContext.Provider>
  );
}

export function useBottomChromeInset() {
  return useContext(BottomChromeInsetContext);
}
