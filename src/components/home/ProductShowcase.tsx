'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { productsList } from '@/data/companyConfig';
import { Product } from '@/types';
import ProductModal from './ProductModal';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface ProductShowcaseProps {
  onRequestQuote: (product?: Product) => void;
}

export default function ProductShowcase({ onRequestQuote }: ProductShowcaseProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(productsList);

  useEffect(() => {
    fetch('/api/products?active=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="products" className="py-16 sm:py-24 md:py-32 bg-[#F8F6EF] relative overflow-hidden border-b border-[#123D2A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20 space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#123D2A]"
          >
            <span className="w-6 h-[1px] bg-[#D4A72C]" />
            <span>Milled Selections</span>
            <span className="w-6 h-[1px] bg-[#D4A72C]" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#123D2A] tracking-tight"
          >
            Our <span className="italic font-normal text-[#D4A72C]">Rice</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-[#17211C]/75 font-serif italic px-2"
          >
            Carefully processed for customers who value quality.
          </motion.p>
        </div>

        {/* Dynamic Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="corporate-card rounded-sm overflow-hidden flex flex-col justify-between group bg-white border border-[#123D2A]/10 shadow-sm"
            >
              <div>
                {/* Image Container with Cinematic Zoom on Hover */}
                <div className="relative h-56 sm:h-64 lg:h-72 w-full overflow-hidden bg-[#123D2A]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center filter brightness-[0.92] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <span className="bg-[#123D2A]/90 backdrop-blur-sm text-[#D4A72C] text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-xs border border-[#D4A72C]/30">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#123D2A] group-hover:text-[#D4A72C] transition-colors leading-tight">
                    {product.name}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-[#17211C]/75 font-sans leading-relaxed line-clamp-3">
                    {product.shortDescription}
                  </p>

                  {/* Pack Sizes */}
                  <div className="pt-2">
                    <span className="text-[11px] text-black/50 block mb-1.5 font-medium uppercase tracking-wider">
                      Available Sizes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.slice(0, 4).map((size) => (
                        <span
                          key={size}
                          className="px-2 py-0.5 bg-[#F8F6EF] text-[#123D2A] text-[11px] font-medium rounded-xs border border-[#123D2A]/10"
                        >
                          {size}
                        </span>
                      ))}
                      {product.sizes.length > 4 && (
                        <span className="px-1.5 py-0.5 text-black/40 text-[11px]">
                          +{product.sizes.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 sm:p-6 pt-0 border-t border-black/5 flex items-center justify-between mt-4 min-h-[48px]">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#123D2A] group-hover:text-[#D4A72C] transition-colors py-2"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onRequestQuote(product)}
                  className="text-xs font-semibold text-[#123D2A] hover:text-[#D4A72C] py-2 underline underline-offset-4 cursor-pointer"
                >
                  Request a Quote
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onRequestQuote={(prod) => {
          setSelectedProduct(null);
          onRequestQuote(prod);
        }}
      />
    </section>
  );
}
