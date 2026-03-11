import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ProductCarousel } from '../../../products/components/product-card/product-carousel/product-carousel';
import { Product } from '../../../products/interfaces/product.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';
import { FormErrorLabel } from '../../../shared/components/form-error-label/form-error-label';
import { ProductsService } from '../../../products/services/products.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'product-details',
  imports: [ProductCarousel, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit {
  product = input.required<Product>();
  wasSaved = signal(false);

  imageFileList: FileList | undefined = undefined;
  tempImages = signal<string[]>([]);

  imagesToCarousel = computed(() => {
    const currentProductImages = [...this.product().images, ...this.tempImages()];

    return currentProductImages;
  });

  router = inject(Router);
  fb = inject(FormBuilder);

  productsService = inject(ProductsService);

  productForm = this.fb.group({
    title: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(1)]],
    sizes: [[''], [Validators.required, Validators.min(0)]],
    images: [['']],
    gender: ['men', [Validators.required, Validators.pattern(/men|women|unisex|kid/)]],
    tags: ['', Validators.required],
  });

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  ngOnInit(): void {
    this.setFormValue(this.product());
  }

  setFormValue(formLike: Partial<Product>) {
    this.productForm.reset(this.product() as any);
    this.productForm.patchValue({
      tags: formLike.tags?.join(','),
    });
    // this.productForm.patchValue(formLike as any);
  }

  onSizeClicked(size: string) {
    const currentSizes = this.productForm.value.sizes ?? [];

    if (currentSizes.includes(size)) {
      currentSizes.splice(currentSizes.indexOf(size), 1);
    } else {
      currentSizes.push(size);
    }

    this.productForm.patchValue({ sizes: currentSizes });
  }

  async onSubmit() {
    const isValid = this.productForm.valid;
    this.productForm.markAllAsTouched();

    if (!isValid) return;
    const formValue = this.productForm.value;

    const productLike: Partial<Product> = {
      ...(formValue as any),
      tags:
        formValue.tags
          ?.toLowerCase()
          .split(',')
          .map((tag) => tag.trim()) ?? [],
    };

    if (this.product().id === 'new') {
      // create new product
      const product = await firstValueFrom(
        this.productsService.createProduct(productLike, this.imageFileList),
      );

      this.router.navigate(['/admin/products', product.id]);
    } else {
      await firstValueFrom(
        this.productsService.updateProduct(this.product().id, productLike, this.imageFileList),
      );
    }

    this.wasSaved.set(true);
    setTimeout(() => {
      this.wasSaved.set(false);
    }, 3000);
  }

  onFilesChanged(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    this.imageFileList = fileList ?? undefined;

    this.tempImages.set([]);

    const imageUrls = Array.from(fileList ?? []).map((file) => URL.createObjectURL(file));

    this.tempImages.set(imageUrls);
  }
}
