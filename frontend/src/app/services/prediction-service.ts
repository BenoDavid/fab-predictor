import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  FABRIC_CONSUMPTION_API,
  FABRIC_DETAIL_API,
} from '../constants/fabric-consumption.constants';
@Injectable({
  providedIn: 'root',
})
export class PredictionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  predict(body: any) {
    return this.http.post(`${this.apiUrl}/predict`, body);
  }
  getFabrics(params: string) {
    return this.http.get(`${FABRIC_DETAIL_API}` + params);
  }
}
