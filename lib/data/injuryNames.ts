import type { Locale } from "@/lib/i18n/context";

export const INJURY_NAMES: Record<Locale, Record<string, string>> = {
  es: {
    hamstring: "Desgarro de isquiotibial",
    meniscus: "Rotura de meniscos",
    acl: "Rotura de ligamentos cruzados",
    tibia_fibula: "Fractura de tibia y peroné",
    achilles: "Rotura del tendón de Aquiles",
    ankle_sprain: "Esguince de tobillo",
    calf_tear: "Desgarro de gemelo",
    metatarsal_fracture: "Fractura de metatarso",
    shoulder_dislocation: "Luxación de hombro",
    disc_hernia: "Hernia de disco",
    // Career-threatening injuries — these lower the ceiling permanently.
    acl_rupture: "Rotura del ligamento cruzado",
    achilles_rupture: "Rotura del tendón de Aquiles",
    double_leg_fracture: "Fractura expuesta de la pierna",
    chronic_pubalgia: "Pubalgia crónica",
    knee_cartilage: "Lesión de cartílago en la rodilla",
  },
  en: {
    hamstring: "Hamstring tear",
    meniscus: "Meniscus tear",
    acl: "Torn ACL",
    tibia_fibula: "Tibia and fibula fracture",
    achilles: "Achilles tendon rupture",
    ankle_sprain: "Ankle sprain",
    calf_tear: "Calf tear",
    metatarsal_fracture: "Metatarsal fracture",
    shoulder_dislocation: "Shoulder dislocation",
    disc_hernia: "Herniated disc",
    // Career-threatening injuries — these lower the ceiling permanently.
    acl_rupture: "Ruptured cruciate ligament",
    achilles_rupture: "Ruptured Achilles tendon",
    double_leg_fracture: "Compound leg fracture",
    chronic_pubalgia: "Chronic pubalgia",
    knee_cartilage: "Knee cartilage damage",
  },
  pt: {
    hamstring: "Distensão de isquiotibial",
    meniscus: "Ruptura do menisco",
    acl: "Ruptura dos ligamentos cruzados",
    tibia_fibula: "Fratura de tíbia e fíbula",
    achilles: "Ruptura do tendão de Aquiles",
    ankle_sprain: "Entorse de tornozelo",
    calf_tear: "Distensão da panturrilha",
    metatarsal_fracture: "Fratura do metatarso",
    shoulder_dislocation: "Luxação do ombro",
    disc_hernia: "Hérnia de disco",
    // Career-threatening injuries — these lower the ceiling permanently.
    acl_rupture: "Ruptura do ligamento cruzado",
    achilles_rupture: "Ruptura do tendão de Aquiles",
    double_leg_fracture: "Fratura exposta da perna",
    chronic_pubalgia: "Pubalgia crônica",
    knee_cartilage: "Lesão de cartilagem no joelho",
  },
};

export function injuryName(locale: Locale, type: string | undefined): string {
  if (!type) return "";
  return INJURY_NAMES[locale][type] ?? type;
}
