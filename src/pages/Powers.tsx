import { BookOpen } from "lucide-react";
import { Link } from "react-router";
import { PowerLibrary } from "../components/PowerLibrary";

/** /powers: the power library, open to anyone (also reachable in game from the nav's book button). */
export const PowersPage = () => (
    <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold flex items-center gap-3"><BookOpen size={36} /> Power library</h1>
        <p className="py-4 max-w-2xl">
            Every few minutes a briefcase drops and offers each player 3 random powers. Instant ones fire as soon
            as you pick them; the others wait in your inventory until you use them. Rarer powers show up less often.{" "}
            <Link to="/about" className="link">How to play</Link>
        </p>
        <PowerLibrary />
    </main>
);
