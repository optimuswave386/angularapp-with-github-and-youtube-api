import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Contact } from './contact';

describe('Contact', () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not send an invalid form', () => {
    component.submit();
    http.expectNone(() => true);
    expect(component.status()).toBe('idle');
  });

  it('sends a valid form', () => {
    component.form.setValue({
      name: 'Test User',
      email: 'test@example.com',
      topic: 'Project inquiry',
      message: 'This is a long enough message to pass validation.',
      website: '',
    });
    component.submit();
    const req = http.expectOne(() => true);
    req.flush(null);
    expect(component.status()).toBe('sent');
  });

  it('silently drops submissions that fill the honeypot', () => {
    component.form.setValue({
      name: 'Bot',
      email: 'bot@example.com',
      topic: 'Project inquiry',
      message: 'This is a long enough message to pass validation.',
      website: 'http://spam.example',
    });
    component.submit();
    http.expectNone(() => true);
    expect(component.status()).toBe('sent');
  });
});
