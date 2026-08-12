import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import schema from "../../schemas/site-config.schema.json";
import rawConfig from "../../config/site.json";
import type { SiteConfig } from "@/types/site-config.schema";

export type { SiteConfig };

let validator: ValidateFunction<SiteConfig> | undefined;

function getValidator(): ValidateFunction<SiteConfig> {
  if (!validator) {
    const ajv = new Ajv2020({ allErrors: true });
    addFormats(ajv);
    validator = ajv.compile<SiteConfig>(schema);
  }
  return validator;
}

let cached: SiteConfig | undefined;

/**
 * The only module that reads `config/site.json` directly. Validates once
 * against `schemas/site-config.schema.json` and caches the result; every
 * caller elsewhere goes through this function.
 *
 * `SiteConfig` is generated from that same schema by `npm run generate:types`.
 * Do not hand-write it — the schema is the single source of truth.
 */
export function getSiteConfig(): SiteConfig {
  if (cached) {
    return cached;
  }

  const validate = getValidator();
  if (!validate(rawConfig)) {
    const details = (validate.errors ?? [])
      .map((error) => {
        const path = error.instancePath || "/";
        const extra = error.params?.additionalProperty
          ? ` (${error.params.additionalProperty})`
          : "";
        return `${path} ${error.message}${extra}`;
      })
      .join("; ");
    throw new Error(`config/site.json failed schema validation: ${details}`);
  }

  cached = rawConfig;
  return cached;
}
