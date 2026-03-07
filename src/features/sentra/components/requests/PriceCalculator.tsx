import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { PriceLineItem } from '../../lib/priceCalculator';

interface PriceCalculatorProps {
  lineItems: PriceLineItem[];
  total: number;
}

export function PriceCalculator({ lineItems, total }: PriceCalculatorProps) {
  if (lineItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lineItems.map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="text-muted-foreground">{item.label}</span>
              <span>{item.price === 0 ? 'Included' : `$${item.price}`}</span>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${total}</span>
        </div>
      </CardContent>
    </Card>
  );
}
