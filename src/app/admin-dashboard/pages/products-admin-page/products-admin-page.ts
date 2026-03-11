import { Component, inject, signal } from '@angular/core';
import { ProductTable } from '../../../products/product-table/product-table';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { PaginationService } from '../../../shared/components/pagination/pagination.service';
import { ProductsService } from '../../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products-admin-page',
  imports: [ProductTable, Pagination, RouterLink],
  templateUrl: './products-admin-page.html',
})
export class ProductsAdminPage {
  paginationService = inject(PaginationService);
  productsService = inject(ProductsService);

  productsPerPage = signal(10);

  productsResource = rxResource({
    params: () => ({ page: this.paginationService.currentPage(), limit: this.productsPerPage() }),
    stream: ({ params }) => {
      return this.productsService.getProducts({
        offset: (params.page - 1) * 9,
        limit: params.limit,
      });
    },
  });
}
