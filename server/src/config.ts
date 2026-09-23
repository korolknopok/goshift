import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Не задана переменная окружения ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  odata: {
    baseUrl: required("ONEC_BASE_URL").replace(/\/+$/, ""),
    user: required("ONEC_USER"),
    password: required("ONEC_PASSWORD"),
  },
};