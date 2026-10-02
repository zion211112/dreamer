import type { Metadata } from "next";
import ProtocolNode from "@/components/protocol-node";
import "./protocol/protocol.css";

export const metadata: Metadata = {
  title: "APT-LABS — Protocol Node",
  description:
    "APT-LABS protocol node — a local-first control plane connecting contribution, collective decisions, allocation, physical execution and verifiable evidence.",
};

export default function Home() {
  return <ProtocolNode />;
}


