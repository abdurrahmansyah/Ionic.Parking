import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TopUpPage } from './top-up.page';

describe('TopUpPage', () => {
  let component: TopUpPage;
  let fixture: ComponentFixture<TopUpPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopUpPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TopUpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
