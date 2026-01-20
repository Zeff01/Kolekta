'use client';

import { PokemonCard } from "@/types/pokemon";
import { Printer } from "lucide-react";

interface PrintCardButtonProps {
  card: PokemonCard;
}

export default function PrintCardButton({ card }: PrintCardButtonProps) {
  const handlePrint = () => {
    // Create print window
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Please allow popups to print the card');
      return;
    }

    // Pokemon card dimensions: 2.5" x 3.5" (63mm x 88mm)
    // Aspect ratio: 245:342 (approximately 5:7)
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print ${card.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            @page {
              size: 2.5in 3.5in;
              margin: 0;
            }

            body {
              margin: 0;
              padding: 0;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }

            .print-container {
              width: 2.5in;
              height: 3.5in;
              position: relative;
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-after: always;
            }

            .card-image {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }

            .no-image {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
              border: 2px solid #000;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }

            .card-name {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 10px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }

            .card-info {
              font-size: 12px;
              text-align: center;
              margin-top: 10px;
            }

            @media print {
              body {
                background: white;
              }

              .print-container {
                page-break-inside: avoid;
              }

              @page {
                margin: 0;
              }
            }

            @media screen {
              body {
                background: #f0f0f0;
                padding: 20px;
              }

              .print-container {
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${card.images.large ?
              `<img src="${card.images.large}" alt="${card.name}" class="card-image" />` :
              `<div class="no-image">
                <div class="card-name">${card.name}</div>
                <div class="card-info">
                  <div>${card.set.name}</div>
                  <div>#${card.number}/${card.set.total}</div>
                  ${card.rarity ? `<div>${card.rarity}</div>` : ''}
                </div>
              </div>`
            }
          </div>
          <script>
            // Auto print when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Close window after printing (or if user cancels)
                // window.onafterprint = function() {
                //   window.close();
                // };
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-retro-blue text-retro-white border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1"
    >
      <Printer className="w-4 h-4" />
      <span className="text-xs font-pixel uppercase">Print Card</span>
    </button>
  );
}
