export function getVehicleImage(manufacturer: string, model: string): string {
  const m = `${manufacturer} ${model}`.toLowerCase();
  if (m.includes("curvv")) return "/images/vehicles/tata-curvv-ev.jpg";
  if (m.includes("nexon")) return "/images/vehicles/tata-nexon-ev.png";
  if (m.includes("xuv") || m.includes("mahindra") || m.includes("be 6") || m.includes("harrier") || m.includes("safari")) {
    return "/images/vehicles/mahindra-xuv400.jpg";
  }
  if (m.includes("mg") || m.includes("zs") || m.includes("windsor") || m.includes("comet")) {
    return "/images/vehicles/mg-zs-ev.jpg";
  }
  if (m.includes("ioniq") || m.includes("hyundai") || m.includes("kia") || m.includes("ev6") || m.includes("kona")) {
    return "/images/vehicles/hyundai-ioniq-5.jpg";
  }
  if (m.includes("atto") || m.includes("byd") || m.includes("seal") || m.includes("et7") || m.includes("tesla")) {
    return "/images/vehicles/byd-atto-3.jpg";
  }
  if (m.includes("punch")) return "/images/vehicles/tata-punch-ev.png";
  if (m.includes("tiago") || m.includes("tigor") || m.includes("hatchback") || m.includes("citroen") || m.includes("ec3")) {
    return "/images/vehicles/tata-tiago-ev.jpg";
  }
  return "/images/vehicles/tata-nexon-ev.png";
}
