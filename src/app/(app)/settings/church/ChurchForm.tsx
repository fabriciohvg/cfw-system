"use client";
import { useEffect, useActionState } from "react";
import { toast } from "sonner";
import { saveChurch, type SaveChurchState } from "./actions";

type Church = {
  name?: string | null;
  cnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  addressLine?: string | null;
  addressExtra?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  presbytery?: string | null;
  organizedAt?: string | null;
  logoUrl?: string | null;
  notes?: string | null;
};
type Props = {
  initial?: Church | null;
  role: "ADMIN" | "APPROVER" | "CONTRIBUTOR" | "READER";
};

const initialState: SaveChurchState = { ok: false };

export default function ChurchForm({ initial, role }: Props) {
  const [state, formAction] = useActionState(saveChurch, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  const disabled = role !== "ADMIN";

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium">Nome da Igreja *</label>
        <input
          name="name"
          defaultValue={initial?.name ?? ""}
          required
          disabled={disabled}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">CNPJ</label>
          <input
            name="cnpj"
            defaultValue={initial?.cnpj ?? ""}
            disabled={disabled}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Presbitério</label>
          <input
            name="presbytery"
            defaultValue={initial?.presbytery ?? ""}
            disabled={disabled}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
            disabled={disabled}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Telefone</label>
          <input
            name="phone"
            defaultValue={initial?.phone ?? ""}
            disabled={disabled}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm">Website</label>
        <input
          name="website"
          defaultValue={initial?.website ?? ""}
          disabled={disabled}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Endereço</label>
          <input
            name="addressLine"
            defaultValue={initial?.addressLine ?? ""}
            disabled={disabled}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Complemento</label>
          <input
            name="addressExtra"
            defaultValue={initial?.addressExtra ?? ""}
            disabled={disabled}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Bairro</label>
          <input
            name="district"
            defaultValue={initial?.district ?? ""}
            disabled={disabled}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Cidade</label>
          <input
            name="city"
            defaultValue={initial?.city ?? ""}
            disabled={disabled}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">UF</label>
          <input
            name="state"
            defaultValue={initial?.state ?? ""}
            disabled={disabled}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">CEP</label>
          <input
            name="postalCode"
            defaultValue={initial?.postalCode ?? ""}
            disabled={disabled}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm">Data de Organização</label>
        <input
          name="organizedAt"
          type="date"
          defaultValue={initial?.organizedAt?.slice(0, 10) ?? ""}
          disabled={disabled}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm">Notas</label>
        <textarea
          name="notes"
          defaultValue={initial?.notes ?? ""}
          disabled={disabled}
          className="w-full border rounded px-3 py-2 min-h-[100px]"
        />
      </div>

      <button
        disabled={disabled}
        className="rounded px-4 py-2 bg-black text-white disabled:opacity-50"
      >
        Salvar
      </button>
    </form>
  );
}
