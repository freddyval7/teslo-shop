import { Component, inject, signal } from '@angular/core';
import { ProductCard } from '../../../products/components/product-card/product-card';
import { ProductsService } from '../../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Product } from '../../../products/interfaces/product.interface';

@Component({
  selector: 'app-home-page',
  imports: [ProductCard],
  templateUrl: './home-page.html',
})
export class HomePage {
  productsService = inject(ProductsService);

  products = signal<Product[]>([]);

  productsResource = rxResource({
    params: () => ({}),
    stream: () => this.productsService.getProducts({}),
  });
}
