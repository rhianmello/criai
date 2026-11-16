# CRIAÍ — two language editions, one paid guide

**Product family:** `CRIAI-EBOOK-IA-01` · **Unit price:** BRL 49.90 · **Format:** PDF · **67 pages per language**.

| Edition | SKU | Language tag | File handling |
|---|---|---|---|
| Portuguese | `CRIAI-EBOOK-IA-01-PT` | `pt-BR` | keep in private storage |
| English | `CRIAI-EBOOK-IA-01-EN` | `en` | keep in private storage |

Both editions cover the same 36 practical steps, 12 worksheets, 10 prompts, financial example, checklist and glossary. The English edition has been authored from the original CRIAÍ material.

**Do not upload the paid PDFs into this public repository, into `assets/`, or as GitHub Pages public links.** The HTML stores only presentation text and SKU metadata. The complete PDFs are currently handed to the owner separately, outside this public repository. The buyer checkout and protected file storage have **not** yet been deployed.

## Current purchase request

- Portuguese sales page: `/apostilas.html`.
- English sales page: `/en/apostilas.html`.
- A radio selector lets the buyer choose the language of the PDF independently of the website language.
- `assets/ebook-language.js` persists this choice **only for the browser session** and includes the SKU and selected edition in the buyer's email request to `suporte@xrmovi.com.br`.
- No automatic payment or automatic download is advertised as live. Seller confirms payment and manually supplies the selected edition.

## Secure post-payment implementation required

1. Store both final PDFs in a **private** object storage bucket, with internal object keys such as `ebooks/ia/v1/pt.pdf` and `ebooks/ia/v1/en.pdf`. Never make the bucket public.
2. Create one product with two valid SKUs, both mapped to the same BRL 49.90 price. Language is not an additional purchase.
3. On payment creation, the backend stores the order and the selected SKU; never accept client-submitted price as authoritative.
4. After verifying the processor webhook and payment directly with the processor API, mark the order paid idempotently. Check seller, amount, currency and ownership before granting access.
5. The protected **download screen** must show two language options, **Português** and **English**, after the user proves authorization to view that order. Whichever version is requested, the backend checks the authorized order and issues a short-lived signed link to the corresponding private object.
6. If policy permits accessing either language after one purchase, authorize both object keys for the same product; do not create a second charge for switching language. The download screen should let the buyer switch languages at any time during their approved access window.
7. Log download grants in a privacy-preserving manner, without showing permanent links in HTML, GitHub logs, analytics or email.
8. Test paid, pending, refused, canceled, duplicate webhooks, refund, expired links, wrong file / wrong language, unauthorized visitor and international cards.
9. Consider rate-limits and watermarking if useful, without pretending downloads can be made impossible to share.

## Launch checklist

- [x] Both editions authored as separate 67-page PDFs.
- [x] Public product pages offer PT/EN edition selection.
- [x] Customer email purchase request includes chosen edition.
- [ ] Private production file storage configured and each PDF uploaded.
- [ ] Backend validation of paid orders and download permissions.
- [ ] Language choice on authorized post-purchase download screen.
- [ ] Payment processor and international checkout tests.
- [ ] Final legal/fiscal/reimbursement disclosures and production review.

Track implementation in issue #9. Do not publish a fake 'Download now' button for an unpaid visitor.