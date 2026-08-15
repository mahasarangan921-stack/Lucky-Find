import { useEffect, useRef, useState } from "react";
import "./TicketDrawReveal.css";

/**
 * TicketDrawReveal
 * Drop this where NumberFinder currently renders its result.
 * It turns "you searched, here's the answer" into a small ceremony:
 * the digits roll like a draw machine, then a foil seal drops and
 * stamps MATCH / NO MATCH before the detail card unfolds.
 *
 * Props:
 *  - query      : string   the number the user searched (e.g. "936510")
 *  - loading    : boolean  true while your search/runSearch is in flight
 *  - result     : object | null   e.g. { lottery, drawNo, date, prize, amount } or null if no match
 *  - searched   : boolean  true once a search has been submitted at least once
 */
export default function TicketDrawReveal({ query, loading, result, searched }) {
  const [phase, setPhase] = useState("idle"); // idle | rolling | sealing | done
  const [rollingDigits, setRollingDigits] = useState(query || "");
  const prevLoading = useRef(loading);

  useEffect(() => {
    if (!searched) {
      setPhase("idle");
      return;
    }

    if (loading) {
      setPhase("rolling");
      const interval = setInterval(() => {
        setRollingDigits(
          (query || "000000")
            .split("")
            .map((d) => (/\d/.test(d) ? Math.floor(Math.random() * 10) : d))
            .join("")
        );
      }, 70);
      return () => clearInterval(interval);
    }

    // loading just finished -> seal, then reveal
    if (prevLoading.current && !loading) {
      setRollingDigits(query || "");
      setPhase("sealing");
      const t = setTimeout(() => setPhase("done"), 650);
      return () => clearTimeout(t);
    }
  }, [loading, searched, query]);

  useEffect(() => {
    prevLoading.current = loading;
  }, [loading]);

  if (!searched) return null;

  const isMatch = !!result;

  return (
    <div className={`tdr phase-${phase}`}>
      <div className="tdr-ticket">
        <div className="tdr-row">
          <span className="tdr-label">Ticket</span>
          <span className="tdr-number">
            {(phase === "rolling" ? rollingDigits : query)
              .split("")
              .map((ch, i) => (
                <span key={i} className="tdr-digit">
                  {ch}
                </span>
              ))}
          </span>
        </div>

        {phase === "sealing" && (
          <div className={`tdr-seal ${isMatch ? "seal-win" : "seal-none"}`}>
            {isMatch ? "MATCH" : "NO MATCH"}
          </div>
        )}

        {phase === "done" && (
          <div className="tdr-detail">
            {isMatch ? (
              <>
                <div className={`tdr-seal seal-win static`}>MATCH</div>
                <p className="tdr-drink">{result.lottery} · {result.drawNo}</p>
                <p className="tdr-note">
                  Drawn {result.date} · {result.prize}
                </p>
                <p className="tdr-price">{result.amount}</p>
              </>
            ) : (
              <>
                <div className="tdr-seal seal-none static">NO MATCH</div>
                <p className="tdr-note">
                  This number didn't appear in any recorded draw. Double-check
                  the digits, or browse recent results.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}