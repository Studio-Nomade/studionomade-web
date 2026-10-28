const cutoffDays = Number(process.env.TEMP_UPLOAD_CUTOFF_DAYS ?? "30");
if (!Number.isInteger(cutoffDays) || cutoffDays < 7)
  throw new Error("TEMP_UPLOAD_CUTOFF_DAYS debe ser entero >= 7");
console.log(
  JSON.stringify(
    {
      mode: "dry-run",
      bucket: "temporary-uploads",
      cutoffDays,
      deletes: 0,
      note: "Requiere inventario autorizado y confirmación humana antes de implementar borrado."
    },
    null,
    2
  )
);
