type Nullish<T> = T | null | undefined;

/**
 * Tipo recursivo que permite que todas as propriedades de um objeto sejam null ou undefined
 * A definição precisa ser feita de forma com que o `obj` da função `coalesceWithDefaults` seja
 * uma versão esparsa do `defaults`, permitindo null/undefined em profundidade.
 *
 * Ou seja ele deve converter o tipo do `default` para uma tipagem esparsa que aceite `obj`
 * @template T Tipo do objeto original
 */
type DeepNullish<T> = {
    [K in keyof T]?: T[K] extends object
    ? DeepNullish<T[K]> | null
    : Nullish<T[K]>;
};

/**
 * Preenche os campos `null` ou `undefined` de um objeto com os valores de um objeto default.
 *
 * @param obj - Objeto de entrada (ex: customer do banco)
 * @param defaults - Objeto com valores default do formulário
 * @returns Novo objeto com os campos preenchidos corretamente
 */
export function coalesceWithDefaults<T extends Record<string, unknown>>(
    obj: DeepNullish<T> | null | undefined,
    defaults: T,
): T {
    if (obj == null) {
        return structuredClone(defaults);
    }

    const result = structuredClone(defaults);

    for (const key of Object.keys(defaults) as (keyof T)[]) {
        const value = obj[key];
        const defaultValue = defaults[key];

        if (value === null || value === undefined) {
            continue; // mantém default
        }

        if (
            typeof defaultValue === "object" &&
            defaultValue !== null &&
            !Array.isArray(defaultValue)
        ) {
            result[key] = coalesceWithDefaults(
                value,
                defaultValue as Record<string, unknown>,
            ) as T[typeof key];
        } else {
            result[key] = value as T[typeof key];
        }
    }

    return result;
}
