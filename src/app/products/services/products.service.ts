import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Gender, Product, ProductsResponse } from '../interfaces/product.interface';

const BASE_URL = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Kid,
  tags: [],
  images: [],
  user: {} as User,
};

import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../auth/interface/user.interface';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  private productsCache = new Map<string, ProductsResponse>();
  private productCache = new Map<string, Product>();

  getProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 9, offset = 0, gender = '' } = options;

    const key = `${limit}-${offset}-${gender}`;
    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }

    return this.http
      .get<ProductsResponse>(`${BASE_URL}/products`, {
        params: {
          limit,
          offset,
          gender,
        },
      })
      .pipe(
        tap((response) => {
          this.productsCache.set(key, response);
        }),
      );
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    const key = `${idSlug}`;
    if (this.productCache.has(key)) {
      return of(this.productCache.get(key)!);
    }

    return this.http.get<Product>(`${BASE_URL}/products/${idSlug}`).pipe(
      tap((response) => {
        this.productCache.set(key, response);
      }),
    );
  }

  getProductById(id: string): Observable<Product> {
    if (id === 'new') return of(emptyProduct);

    const key = `${id}`;
    if (this.productCache.has(key)) {
      return of(this.productCache.get(key)!);
    }

    return this.http.get<Product>(`${BASE_URL}/products/${id}`).pipe(
      tap((response) => {
        this.productCache.set(key, response);
      }),
    );
  }

  updateProduct(id: string, productLike: Partial<Product>): Observable<Product> {
    return this.http
      .patch<Product>(`${BASE_URL}/products/${id}`, productLike)
      .pipe(tap((product) => this.updateProductCache(product)));
  }

  createProduct(productLike: Partial<Product>): Observable<Product> {
    return this.http
      .post<Product>(`${BASE_URL}/products`, productLike)
      .pipe(tap((product) => this.updateProductCache(product)));
  }

  updateProductCache(product: Product) {
    const productId = product.id;

    this.productCache.set(productId, product);
    this.productsCache.forEach((productsResponse) => {
      productsResponse.products = productsResponse.products.map((currentProduct) =>
        currentProduct.id === productId ? product : currentProduct,
      );
    });
  }
}
