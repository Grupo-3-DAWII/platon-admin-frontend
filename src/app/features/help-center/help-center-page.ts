import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { Icon } from '../../shared/components/icon/icon';
import { SearchInput } from '../../shared/components/search-input/search-input';

type HelpCategoryId =
  'all' | 'products' | 'inventory' | 'sales' | 'customers' | 'users' | 'reports';

interface HelpCategory {
  id: Exclude<HelpCategoryId, 'all'>;
  title: string;
  description: string;
  icon: string;
  backgroundClass: string;
  iconBackgroundClass: string;
}

interface FaqItem {
  id: number;
  category: Exclude<HelpCategoryId, 'all'>;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-help-center-page',
  standalone: true,
  imports: [NgClass, Icon, SearchInput],
  templateUrl: './help-center-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpCenterPage {
  readonly searchTerm = signal('');
  readonly selectedCategory = signal<HelpCategoryId>('all');
  readonly activeFaqId = signal<number | null>(null);

  readonly supportWhatsapp = '51953376386';

  readonly whatsappMessage = 'Hola, necesito ayuda con el sistema de Librería Platón.';

  readonly categories: HelpCategory[] = [
    {
      id: 'products',
      title: 'Productos',
      description: 'Libros, autores, editoriales y categorías.',
      icon: 'products',
      backgroundClass: 'bg-card-sales',
      iconBackgroundClass: 'bg-card-sales-icon-bg',
    },
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Stock, movimientos y disponibilidad.',
      icon: 'inventory',
      backgroundClass: 'bg-card-customers',
      iconBackgroundClass: 'bg-card-customers-icon-bg',
    },
    {
      id: 'sales',
      title: 'Ventas',
      description: 'Registro y consulta de operaciones.',
      icon: 'sales',
      backgroundClass: 'bg-card-orders',
      iconBackgroundClass: 'bg-card-orders-icon-bg',
    },
    {
      id: 'customers',
      title: 'Clientes',
      description: 'Registro y consulta de clientes.',
      icon: 'customers',
      backgroundClass: 'bg-brand-soft',
      iconBackgroundClass: 'bg-brand',
    },
    {
      id: 'users',
      title: 'Usuarios',
      description: 'Usuarios, accesos y responsabilidades.',
      icon: 'users',
      backgroundClass: 'bg-card-products',
      iconBackgroundClass: 'bg-card-products-icon-bg',
    },
    {
      id: 'reports',
      title: 'Reportes',
      description: 'Ventas, stock y libros más vendidos.',
      icon: 'reports',
      backgroundClass: 'bg-info-soft',
      iconBackgroundClass: 'bg-info',
    },
  ];

  readonly faqs: FaqItem[] = [
    {
      id: 1,
      category: 'products',
      question: '¿Cómo registrar un nuevo libro?',
      answer:
        'Ingresa al módulo Productos y selecciona “Nuevo producto”. Completa la información solicitada y guarda el registro.',
    },
    {
      id: 2,
      category: 'products',
      question: '¿Por qué no puedo registrar un ISBN repetido?',
      answer:
        'El ISBN identifica de forma única a cada libro, por lo que el sistema no permite registrar dos productos con el mismo ISBN.',
    },
    {
      id: 3,
      category: 'products',
      question: '¿Cómo editar la información de un libro?',
      answer:
        'Abre el producto desde el catálogo y selecciona la opción de edición. Modifica los datos permitidos y guarda los cambios.',
    },
    {
      id: 4,
      category: 'inventory',
      question: '¿Cómo actualizar el stock de un libro?',
      answer:
        'Ingresa al módulo Inventario, localiza el libro y registra el movimiento correspondiente.',
    },
    {
      id: 5,
      category: 'inventory',
      question: '¿Qué significa “Poco stock”?',
      answer:
        'Indica que las existencias disponibles del libro han alcanzado un nivel bajo y requieren atención desde Inventario.',
    },
    {
      id: 6,
      category: 'inventory',
      question: '¿Qué significa que un libro esté agotado?',
      answer:
        'Significa que actualmente no existen unidades disponibles del libro para una nueva venta.',
    },
    {
      id: 7,
      category: 'sales',
      question: '¿Cómo registrar una venta?',
      answer:
        'Ingresa al módulo Ventas, selecciona los libros correspondientes, completa la información requerida y confirma la operación.',
    },
    {
      id: 8,
      category: 'sales',
      question: '¿Por qué una venta puede no confirmarse?',
      answer:
        'Una venta no puede confirmarse si no existe una reserva de stock exitosa para los libros incluidos.',
    },
    {
      id: 9,
      category: 'sales',
      question: '¿Quién puede anular una venta?',
      answer:
        'La anulación de una venta es una operación autorizada para el Administrador del sistema.',
    },
    {
      id: 10,
      category: 'customers',
      question: '¿Cómo registrar un nuevo cliente?',
      answer:
        'Ingresa al módulo Clientes, selecciona la opción para registrar un cliente y completa la información solicitada.',
    },
    {
      id: 11,
      category: 'customers',
      question: '¿Por qué no puedo registrar el mismo documento dos veces?',
      answer:
        'El documento de un cliente debe ser único dentro del sistema y no puede registrarse más de una vez.',
    },
    {
      id: 12,
      category: 'users',
      question: '¿Cómo registrar un nuevo usuario?',
      answer:
        'Ingresa al módulo Usuarios y utiliza la opción correspondiente para crear un nuevo usuario del sistema.',
    },
    {
      id: 13,
      category: 'users',
      question: '¿Todos los usuarios tienen las mismas opciones?',
      answer:
        'No. Las funciones disponibles dependen del rol y de las responsabilidades asignadas a cada usuario.',
    },
    {
      id: 14,
      category: 'reports',
      question: '¿Qué información puedo consultar en Reportes?',
      answer: 'El sistema contempla reportes relacionados con ventas, stock y libros más vendidos.',
    },
    {
      id: 15,
      category: 'reports',
      question: '¿Quién puede consultar los reportes globales?',
      answer: 'El acceso a los reportes globales está reservado para el Administrador.',
    },
  ];

  readonly filteredFaqs = computed(() => {
    const term = this.normalizeText(this.searchTerm());
    const category = this.selectedCategory();

    return this.faqs.filter((faq) => {
      const matchesCategory = category === 'all' || faq.category === category;

      const matchesSearch =
        !term ||
        this.normalizeText(faq.question).includes(term) ||
        this.normalizeText(faq.answer).includes(term);

      return matchesCategory && matchesSearch;
    });
  });

  readonly selectedCategoryLabel = computed(() => {
    const selected = this.selectedCategory();

    if (selected === 'all') {
      return null;
    }

    return this.categories.find((category) => category.id === selected)?.title ?? null;
  });

  readonly whatsappUrl = computed(() => {
    const message = encodeURIComponent(this.whatsappMessage);

    return `https://wa.me/${this.supportWhatsapp}?text=${message}`;
  });

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.activeFaqId.set(null);
  }

  selectCategory(category: HelpCategoryId): void {
    this.selectedCategory.update((current) => (current === category ? 'all' : category));

    this.activeFaqId.set(null);
  }

  showAllCategories(): void {
    this.selectedCategory.set('all');
    this.activeFaqId.set(null);
  }

  toggleFaq(id: number): void {
    this.activeFaqId.update((current) => (current === id ? null : id));
  }

  private normalizeText(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
