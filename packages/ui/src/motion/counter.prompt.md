# Counter

Cifra que cuenta de `from` a `to` al entrar en viewport (2.4s power4.out), una
sola vez. Server Component; lo anima `MotionRoot`.

```tsx
<Counter to={50} prefix="+" />            {/* +00 → +50 */}
<Counter to={4} pad={2} />                {/* 00 → 04 */}
<Counter to={98.5} decimals={1} suffix="%" />
```

| Prop       | Tipo            | Por defecto |
| ---------- | --------------- | ----------- |
| `to`       | número final    | —           |
| `from`     | número inicial  | `0`         |
| `pad`      | dígitos mínimos | `0`         |
| `decimals` | decimales       | `0`         |
| `prefix`   | texto antes     | `""`        |
| `suffix`   | texto después   | `""`        |
| `duration` | segundos        | `2.4`       |
| `as`       | etiqueta        | `"span"`    |

El HTML trae siempre el **valor final**: sin JS o con movimiento reducido se ve
la cifra real. Usa cifras tabulares para que no baile al contar.
