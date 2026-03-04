import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ProductCard } from '../../../products/components/product-card/product-card';
import { ProductsService } from '../../../products/services/products.service';
import { TitleCasePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-gender-page',
  imports: [ProductCard, TitleCasePipe],
  templateUrl: './gender-page.html',
})
export class GenderPage {
  route = inject(ActivatedRoute);
  gender = toSignal(this.route.params.pipe(map(({ gender }) => gender)));

  productsService = inject(ProductsService);

  productsResource = rxResource({
    params: () => ({ gender: this.gender() }),
    stream: ({ params }) => this.productsService.getProducts({ gender: params.gender }),
  });
}
