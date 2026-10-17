'use client';

import {useState} from 'react';
import {MAX_SALE_QUANTITY, parsedSaleQuantity, saleLimit, saleRevenue} from '../lib/sales';

interface SellControlsProps {
  kind: string;
  label: string;
  stock: number;
  unitPrice: number;
  disabled: boolean;
  onSell: (kind: string, quantity: number) => Promise<boolean>;
}

export default function SellControls({kind, label, stock, unitPrice, disabled, onSell}: SellControlsProps) {
  const [rawQuantity, setRawQuantity] = useState('1');
  const maxQuantity = saleLimit(stock);
  const quantity = parsedSaleQuantity(rawQuantity, stock);
  const valid = quantity !== null;
  const total = valid ? saleRevenue(quantity, unitPrice) : 0;

  const setClampedQuantity = (amount: number) => {
    setRawQuantity(String(Math.max(1, Math.min(maxQuantity, amount))));
  };

  const confirm = async () => {
    if (quantity === null || disabled) return;
    // The Go backend performs the definitive stock check and atomic deduction.
    if (await onSell(kind, quantity)) setRawQuantity('1');
  };

  return <div className="eco-sell-panel">
    <div className="eco-sell-stepper" role="group" aria-label={`Số lượng bán ${label}`}>
      <button type="button" aria-label={`Giảm số lượng ${label}`} disabled={disabled || quantity === null || quantity <= 1} onClick={() => setClampedQuantity((quantity ?? 1) - 1)}>−</button>
      <input
        type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
        aria-label={`Số lượng ${label} muốn bán`}
        value={rawQuantity}
        onChange={event => {
          if (/^\d{0,4}$/.test(event.target.value)) setRawQuantity(event.target.value);
        }}
        onBlur={() => setClampedQuantity(Number.isSafeInteger(Number(rawQuantity)) ? Number(rawQuantity) : 1)}
      />
      <button type="button" aria-label={`Tăng số lượng ${label}`} disabled={disabled || (valid && quantity >= maxQuantity)} onClick={() => setClampedQuantity(quantity === null ? 1 : quantity + 1)}>+</button>
    </div>
    <button type="button" className="eco-sell-max" disabled={disabled || maxQuantity < 1} onClick={() => setClampedQuantity(maxQuantity)}>
      Tối đa{stock > MAX_SALE_QUANTITY ? ` ${MAX_SALE_QUANTITY}` : ''}
    </button>
    <div className="eco-sell-estimate" aria-live="polite">
      <span>{unitPrice.toLocaleString('vi-VN')} xu / món</span>
      <strong>{valid ? `+${total.toLocaleString('vi-VN')} xu` : 'Số lượng sai'}</strong>
    </div>
    <button type="button" className="eco-sell-confirm" disabled={disabled || !valid} onClick={() => void confirm()}>
      Bán{valid ? ` ${quantity}` : ''}
    </button>
  </div>;
}
