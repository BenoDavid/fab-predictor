import { Component, signal } from '@angular/core';
import { PredictionService } from '../../services/prediction-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-predict-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './predict-component.html',
  styleUrl: './predict-component.css',
})
export class PredictComponent {
  // ---------------------------
  // SIGNALS (Reactive State)
  // ---------------------------
  result = signal<any>(null);
  selectedFabric = signal<any>(null);

  error = signal<string>('');
  pageLoader = signal<boolean>(false);
  historicalData = signal<any[]>([]);
  orderedFabrics = signal<any[]>([]);

  isBookConsumption = signal<boolean>(false);
  // FORM DATA (still simple object)`
  // formData: any = {
  //   style: 'ST-1001',
  //   po: 'PO-TEST001',
  //   color: 'Navy',
  //   fabric_type: 'Single Jersey',
  //   qty: 1000,
  //   buyer: 'BuyerA',
  //   season: 'SS25',
  //   supplier: 'SupplierA',
  //   factory: 'Factory1',
  //   gsm: 160,
  //   width_mm: 1800,
  //   shrinkage_warp_pct: 4.0,
  //   shrinkage_weft_pct: 5.0,
  //   marker_efficiency_pct: 0,
  //   wash_type: 'None',
  // };
  formData: any = {
    style: '',
    po: '',
    color: '',
    fabric_type: '',
    qty: 0,
    buyer: '',
    season: '',
    supplier: '',
    factory: '',
    gsm: 0,
    width_mm: 0,
    // shrinkage_warp_pct: 0,
    // shrinkage_weft_pct: 0,
    // marker_efficiency_pct: 0,
    wash_type: '',
  };
  constructor(private predictionService: PredictionService) {}
  searchResults() {
    if (!this.formData.style) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Style is required to search fabrics!',
      });
      return;
    }
    this.pageLoader.set(true);
    this.historicalData.set([]); // Clear previous results
    this.predictionService
      .getFabrics('?style=' + this.formData.style + `&indentStatus=Open&season=SS26`)
      .subscribe({
        next: (res: any) => {
          console.log('Fabric search result:', res);
          this.historicalData.set(res?.result || []); // <-- Reactive, auto-updates UI
          this.pageLoader.set(false);
          // Handle fabric search results as needed
        },
        error: () => {
          this.error.set('Fabric search failed. Check backend or parameters.');
        },
      });
  }
  calculateDeviation(estimate: number, value: number): string {
    if (!estimate || !value) return '-';

    const deviation = ((value - estimate) / estimate) * 100;

    // Format to 2 decimals and add + sign for positive values
    const formatted = deviation.toFixed(2);

    return deviation > 0 ? `+${formatted}%` : `${formatted}%`;
  }
  submitForm(fabric: any) {
    console.log('Submitting form with data:', fabric);
    this.selectedFabric.set(fabric); // Store selected fabric for potential future use
    let requestBody = {
      style: fabric?.style + '' || '',
      po: fabric?.po || '',
      color: fabric?.color + '' || '',
      fabric_type: fabric?.productCategory || '',
      qty: Math.round(fabric?.indentQty) || 0,
      buyer: fabric?.brand || '',
      season: fabric?.season || '',
      supplier: '',
      factory: '',
      gsm: 0,
      width_mm: 0,
      shrinkage_warp_pct: 0,
      shrinkage_weft_pct: 0,
      marker_efficiency_pct: 0,
      wash_type: '',
    };

    console.log('Final request body for prediction:', requestBody);
    this.error.set('');
    this.result.set(null);
    if (!fabric.mark_cons) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Fabric consumption data is missing for this fabric. Please check the details.',
      });
      return;
    }
    if (!requestBody.qty || requestBody.qty <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Quantity must be greater than 0.',
      });
      return;
    }

    this.pageLoader.set(true);

    this.predictionService.predict(requestBody).subscribe({
      next: (res: any) => {
        console.log('Prediction result:', res);
        this.result.set(res); // <-- Reactive, auto-updates UI

        this.pageLoader.set(false);
      },
      error: () => {
        this.error.set('Prediction failed. Check backend or parameters.');
        this.pageLoader.set(false);
      },
    });
  }
  placeOrder() {
    const fabric = this.selectedFabric();
    if (!fabric) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No fabric selected for ordering. Please select a fabric first.',
      });
      return;
    }
    this.orderedFabrics.update((fabrics) => [...fabrics, fabric]);
    //add api

    //till here
    Swal.fire({
      icon: 'success',
      title: 'Order Placed',
      text: `Your order has been placed successfully!`,
    });
  }
}
