import { Activity, Brain, Droplet, Heart } from "lucide-react";

const ICONS = {
  heart: Heart,
  kidney: Droplet,
  stroke: Brain,
  diabetes: Activity,
};

export default function DiseaseIcon({ disease, size = 18, className = "" }) {
  const Icon = ICONS[disease] || Activity;
  return <Icon size={size} className={className} strokeWidth={2} />;
}
