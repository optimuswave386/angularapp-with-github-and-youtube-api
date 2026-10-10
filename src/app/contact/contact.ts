import {
  Component, ElementRef, PLATFORM_ID, ViewChild, inject, signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

/**
 * Everything you will want to edit lives here.
 * TODO: replace every placeholder value below with your real details.
 */
const CONTACT = {
  email: 'asad.liaqat@outlook.com',
  linkedin: 'https://www.linkedin.com/in/asad-ali-182910394',
  github: 'https://github.com/optimuswave386',
  youtube: 'https://www.youtube.com/@Asad-b8c2i',
  bookingUrl: 'https://calendar.app.google/tgVDcj5EMnr2e23KA',   // Google Meet
  resumeUrl: 'assets/resume/AsadAli_WebDesigner-Developer_Resume.pdf',    // put the PDF in src/assets/resume/
  apiUrl: 'https://expressjs-api-eight.vercel.app/contact',                            // full URL of your Express backend if it is on another domain
  availability: 'Available for new projects this quarter', // keep in sync with the hero text
  replyTime: 'within 1–2 business days',
  timeZone: 'Central Time (US)',
  hours: 'Monday to Friday',
};

const TOPICS = [
  'Project inquiry',
  'Job opportunity',
  'QA / testing work',
  'Just saying hi',
];

const FIT = {
  good: [
    'Websites and web apps in Angular/React',
    'Express back ends and API integrations',
    'QA testing, test planning and defect tracking',
  ],
  notFit: [
    'Native mobile apps',
    'Projects that need to start within a few days',
  ],
};

const FAQ = [
  {
    q: 'How quickly can you start?',
    a: 'It depends on my current workload. Tell me your deadline in the message and I will say right away whether it works.',
  },
  {
    q: 'How do you work with clients?',
    a: 'We agree on scope first, then I share progress in small steps so you can react early instead of at the end.',
  },
  {
    q: 'What do you need to get started?',
    a: 'A short description of the goal, who the site or app is for, any deadlines, and examples of things you like.',
  },
];

const ERRORS: Record<string, Record<string, string>> = {
  name: {
    required: 'Enter your name.',
    minlength: 'Your name needs at least 2 characters.',
  },
  email: {
    required: 'Enter your email so I can reply.',
    email: 'Enter a valid email address, like name@example.com.',
  },
  topic: {
    required: 'Choose what your message is about.',
  },
  message: {
    required: 'Write a message so I know how to help.',
    minlength: 'Add a little more detail (at least 20 characters).',
    maxlength: 'Keep your message under 2,000 characters.',
  },
};

type Status = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
})
export class Contact {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly c = CONTACT;
  readonly topics = TOPICS;
  readonly fit = FIT;
  readonly faq = FAQ;

  readonly status = signal<Status>('idle');
  readonly submitted = signal(false);
  readonly copied = signal(false);
  readonly copyFailed = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    topic: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    website: [''], // honeypot: real people never see or fill this
  });

  /** Moves keyboard focus to the confirmation message when it appears. */
  @ViewChild('done') set doneEl(el: ElementRef<HTMLElement> | undefined) {
    el?.nativeElement.focus();
  }

  constructor() {
    inject(Title).setTitle('Contact | Asad Ali');
  }

  showError(name: 'name' | 'email' | 'topic' | 'message'): boolean {
    const ctrl = this.form.controls[name];
    return ctrl.invalid && (ctrl.touched || this.submitted());
  }

  errorText(name: 'name' | 'email' | 'topic' | 'message'): string {
    const errors = this.form.controls[name].errors;
    if (!errors) return '';
    const key = Object.keys(errors).find((k) => ERRORS[name][k]);
    return key ? ERRORS[name][key] : 'Check this field.';
  }

  submit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.isBrowser) {
        // Wait for the error messages to render, then focus the first bad field.
        setTimeout(() => {
          this.host.nativeElement
            .querySelector<HTMLElement>('[aria-invalid="true"]')
            ?.focus();
        });
      }
      return;
    }

    const value = this.form.getRawValue();

    // Honeypot filled in: it is a bot. Pretend it worked and send nothing.
    if (value.website) {
      this.status.set('sent');
      return;
    }
    
    this.status.set('sending');
    this.http.post(CONTACT.apiUrl, value).subscribe({
      next: () => this.status.set('sent'),
      error: () => this.status.set('error'),
    });
  }

  reset(): void {
    this.form.reset();
    this.submitted.set(false);
    this.status.set('idle');
  }

  async copyEmail(): Promise<void> {
    this.copyFailed.set(false);
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      this.copyFailed.set(true);
    }
  }
}
