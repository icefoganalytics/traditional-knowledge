# Agreement document templates

`confidentiality-acknowledgement-template.docx` and `confidentiality-receipt-template.docx`
are rendered with [docxtemplater](https://docxtemplater.com/) from the data returned by
the matching serializer under
`api/src/serializers/information-sharing-agreements/`.

## Editing a template

Edit these files in Microsoft Word and save as `.docx`. Do not edit the XML inside the
archive by hand: placeholders are frequently split across several `<w:r>` runs, so a text
replacement that looks correct can produce a document Word refuses to open.

A rendering failure is now returned as an HTTP 400 rather than a truncated download, so a
broken template surfaces as an error message instead of a corrupt file (TK-39).

## Outstanding: optional sections (TK-44)

The API supplies data for every optional section, and the form at
**Agreement → Additional Details (optional)** collects it, but the acknowledgement template
does not yet reference these placeholders. Until they are added, sections 2, 3, 7, 8, 9 and
10 render with empty checkboxes.

Replace the static `☐` characters in each section with a conditional block. `{#name}…{/name}`
renders its contents only when `name` is true, so the pattern for a checked box is:

```
{#detail_level.is_summary}☒ Summary: Notes, high-level summary, redacted portions.{/detail_level.is_summary}
{^detail_level.is_summary}☐ Summary: Notes, high-level summary, redacted portions.{/detail_level.is_summary}
```

Section 4 already uses this pattern and is the best reference.

### Available placeholders

**Section 2 — level of detail**

- `detail_level.is_original`
- `detail_level.is_summary`
- `detail_level.is_context_specific`
- `detail_notes` (free text)

**Section 3 — formats**

- `formats.is_word_documents`
- `formats.is_audio_or_video`
- `formats.is_excel_spreadsheets`
- `formats.is_gis_files`
- `formats.is_pdf_or_scanned`
- `formats.is_photos`
- `formats.is_hard_copies`
- `formats.is_other`

**Section 7 — credit**

- `credit_lines.is_external_organization`
- `credit_lines.is_other`
- `credit_notes` (free text)

**Section 8 — expiration notifications**

- `expiration_actions.is_notify_designated_contacts_for_amendment`
- `expiration_actions.is_notify_authorized_personnel`
- `expiration_actions.is_notify_designated_contacts_of_expiry`
- `expiration_actions.is_send_removal_receipt`
- `expiration_actions.is_other`
- `expiration_notes` (free text)

**Section 9 — breach actions**

- `breach_actions.is_notify_and_resolve`
- `breach_actions.is_notify_and_pause_authorizations`
- `breach_actions.is_terminate_and_delete`
- `breach_actions.is_communicate_amendments`
- `breach_actions.is_reconcile_completed_purpose`
- `breach_notes` (free text)

**Section 10 — compelled disclosure**

- `disclosure_notes` (free text)

The option values behind these are defined in
`api/src/models/information-sharing-agreement-options.ts`, mirrored in
`web/src/api/information-sharing-agreement-options.ts`, with their user-facing wording in
`web/src/locales/en.js`. Keep the three in sync.

### Known template issue

Both `.docx` files contain undeclared `[trash]/0000.dat`…`0003.dat` parts with no
`Default Extension="dat"` entry in `[Content_Types].xml`, plus a non-standard
`word/footer.xml`, which suggests they were last written by a tool other than Word. Word
may report "unreadable content" on the rendered output even when rendering succeeds.
Re-saving each template from Microsoft Word clears this.
