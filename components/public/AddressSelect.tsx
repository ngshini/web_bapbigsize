"use client";

import { useEffect, useMemo, useState } from "react";

type Ward = string;
type District = { name: string; wards: Ward[] };
type Province = { name: string; districts: District[] };

type AddressValue = { province: string; district: string; ward: string };

type AddressSelectProps = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  className?: string;
};

// Dữ liệu hành chính VN (63 tỉnh/thành) được tải động từ /public để không làm nặng bundle JS.
let cachedData: Province[] | null = null;
let pendingFetch: Promise<Province[]> | null = null;

function loadAddressData(): Promise<Province[]> {
  if (cachedData) return Promise.resolve(cachedData);
  if (!pendingFetch) {
    pendingFetch = fetch("/vn-address.json")
      .then((res) => res.json())
      .then((data: Province[]) => {
        cachedData = data;
        return data;
      })
      .catch(() => []);
  }
  return pendingFetch;
}

const selectClass = "min-h-14 rounded-md border-slate-300 text-lg disabled:bg-slate-50 disabled:text-slate-400";

export function AddressSelect({ value, onChange, className }: AddressSelectProps) {
  const [provinces, setProvinces] = useState<Province[]>(cachedData ?? []);

  useEffect(() => {
    let active = true;
    loadAddressData().then((data) => {
      if (active) setProvinces(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const districts = useMemo(
    () => provinces.find((p) => p.name === value.province)?.districts ?? [],
    [provinces, value.province]
  );
  const wards = useMemo(
    () => districts.find((d) => d.name === value.district)?.wards ?? [],
    [districts, value.district]
  );

  const loading = provinces.length === 0;

  return (
    <div className={className ?? "grid gap-4 md:grid-cols-3"}>
      <select
        className={selectClass}
        value={value.province}
        disabled={loading}
        onChange={(event) => onChange({ province: event.target.value, district: "", ward: "" })}
      >
        <option value="">{loading ? "Đang tải..." : "Chọn tỉnh/thành phố"}</option>
        {provinces.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={value.district}
        disabled={!value.province}
        onChange={(event) => onChange({ ...value, district: event.target.value, ward: "" })}
      >
        <option value="">Chọn Quận/huyện</option>
        {districts.map((d) => (
          <option key={d.name} value={d.name}>
            {d.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={value.ward}
        disabled={!value.district}
        onChange={(event) => onChange({ ...value, ward: event.target.value })}
      >
        <option value="">Chọn Phường/xã</option>
        {wards.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
    </div>
  );
}
