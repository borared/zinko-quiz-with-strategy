import { Zap, Cloud, Eye, Target } from "lucide-react";

export const SKILLS = [
  {
    id: "rabbit",
    name: "The Rabbit",
    icon: Zap,
    skillDescription: "Adrenaline Rush: 2x Points (5s)",
    color: "#F39C12",
    buttonColor: "bg-[#F39C12]",
    buttonBorder: "border-[#D68910]",
    buttonShadow: "#D68910",
  },
  {
    id: "fox",
    name: "The Fox",
    icon: Cloud,
    skillDescription: "Smokescreen: Blind Enemies (5s)",
    color: "#E74C3C",
    buttonColor: "bg-[#E74C3C]",
    buttonBorder: "border-[#C0392B]",
    buttonShadow: "#C0392B",
  },
  {
    id: "butterfly",
    name: "The Butterfly",
    icon: Eye,
    skillDescription: "Oracle: Remove 2 Wrong Answers",
    color: "#9B59B6",
    buttonColor: "bg-[#9B59B6]",
    buttonBorder: "border-[#8E44AD]",
    buttonShadow: "#8E44AD",
  },
  {
    id: "frog",
    name: "The Frog",
    icon: Target,
    skillDescription: "Sticky Tongue: Steal 50% Enemy Points",
    color: "#27AE60",
    buttonColor: "bg-[#27AE60]",
    buttonBorder: "border-[#1E8449]",
    buttonShadow: "#1E8449",
  },
];

export const getSkillConfig = (skillId) => {
  return SKILLS.find(s => s.id === skillId) || SKILLS[0];
};
