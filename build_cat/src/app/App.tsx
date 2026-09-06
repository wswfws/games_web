import { useState } from "react";
import { GameScreen } from "@/widgets/game-screen/ui/game-screen";
import { WikiPage } from "@/pages/wiki/WikiPage";
import "./styles/globals.css";

type BuildCatPage = "game" | "wiki";

export default function App() {
  const [page, setPage] = useState<BuildCatPage>("game");

  if (page === "wiki") return <WikiPage />;
  return <GameScreen onOpenWiki={() => setPage("wiki")} />;
}
