---
title: "Salesforce Fundaciones - notas"
description: "Objetos, campos, relaciones y conversión de plomo en una página: el modelo de datos CRM Analytics El tablero está construido."
section: "salesforce-foundations"
lessons: 1
---

## 1 · Los objetos son tablas

**Objeto** = una tabla · **récord** = una fila · **sobre el terreno** = una columna.

- Nave de objetos estándar con Salesforce: Lead, Account, Contact, Opportunity, Campaign, Case
- Los objetos personalizados terminan en `__c` (por ejemplo. `Subscription__c`)

| Objeto | Un disco es... |
|---|---|
| Lead | a person, not yet qualified |
| Cuenta | a company |
| Contacto | a person at an account |
| Oportunidad | un acuerdo, con la cantidad + etapa |

## 2 · Los tipos de campo deciden qué puede hacer un gráfico

- **Dimensiones** — texto, selección → grupo y filtro
- **Medidas** — números, moneda → suma, promedio, cuenta
- **Fechas** - poner un eje de tiempo, comparar períodos

> Cuidado: un campo "revenue" almacenado como texto no se puede resumir. ¡Mira el tipo primero!

## 3 · Relaciones

- **Lookup** - suelto. El niño puede vivir solo, tiene su propio compartir. *Oportunidad → Campaña*
- **Master-detail** - apretado. El niño muere con el padre, hereda compartir, el padre recibe resúmenes enrollados
- **Muchas a muchas personas** - necesita un objeto de unión. *Oportunidad ↔ Contacto* a través de **Función de contacto de oportunidad**

## 4 · Conversión de plomo

::hand-chart{type="flow" title="One Lead, three records"}
---
labels:
  - "Lead"
  - "Cuenta"
  - "Contacto"
  - "Oportunidad"
---
::

El plomo convertido mantiene `ConvertedAccountId`, `ConvertedContactId`, `ConvertedOpportunityId` → esto es lo que hace **análisis de embudos** posible.

## 5 · Ids, nunca nombres

- 15 caracteres (sensibles en caso) o **18** (insensible)
- Primero 3 = el objeto: `001` Cuenta · `003` Contacto `006` Oportunidad · `00Q` Lead
- Cada receta se une a los partidos en una **Id** — los nombres repiten y cambian

## 6 · Cómo CRM Analytics lo lee

::hand-chart{type="flow" title="Objects to dashboard"}
---
labels:
  - "Objetos"
  - "Data Sync"
  - "Receta"
  - "Dataset"
  - "Dashboard"
---
::

Dashboards consulta **conjuntos de datos**, nunca objetos directamente. Elija el **grano** primero: una fila por oportunidad, por cuenta, o por guía.
