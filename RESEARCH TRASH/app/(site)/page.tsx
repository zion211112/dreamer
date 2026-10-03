import type { Metadata } from "next";
import ProtocolNode from "@/components/protocol-node";
import "./protocol/protocol.css";
import "./protocol/console.css";

export const metadata: Metadata = {
  title: "APT-LABS — Node Console",
  description:
    "APT-LABS node console — a local-first control plane connecting contribution, collective decisions, allocation, physical execution and verifiable evidence.",
};

export default function Home() {
  return <ProtocolNode />;
}


