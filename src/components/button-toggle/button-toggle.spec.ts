import {
  it,
  describe,
  beforeEach,
  beforeEachProviders,
  inject,
  async,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {NgControl, disableDeprecatedForms, provideForms} from '@angular/forms';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {Component, DebugElement, provide} from '@angular/core';
import {By} from '@angular/platform-browser';
import {
  MD_BUTTON_TOGGLE_DIRECTIVES,
  MdButtonToggleGroup,
  MdButtonToggle,
  MdButtonToggleGroupMultiple,
  MdButtonToggleChange,
} from './button-toggle';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';


describe('MdButtonToggle', () => {
  let builder: TestComponentBuilder;
  let dispatcher: MdUniqueSelectionDispatcher;

  beforeEachProviders(() => [
    disableDeprecatedForms(),
    provideForms(),
    provide(MdUniqueSelectionDispatcher, {useFactory: () => {
      dispatcher = new MdUniqueSelectionDispatcher();
      return dispatcher;
    }})
  ]);

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  describe('inside of an exclusive selection group', () => {
    let fixture: ComponentFixture<ButtonTogglesInsideButtonToggleGroup>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let buttonToggleDebugElements: DebugElement[];
    let buttonToggleNativeElements: HTMLElement[];
    let groupInstance: MdButtonToggleGroup;
    let buttonToggleInstances: MdButtonToggle[];
    let testComponent: ButtonTogglesInsideButtonToggleGroup;

    beforeEach(async(() => {
      builder.createAsync(ButtonTogglesInsideButtonToggleGroup).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        groupDebugElement = fixture.debugElement.query(By.directive(MdButtonToggleGroup));
        groupNativeElement = groupDebugElement.nativeElement;
        groupInstance = groupDebugElement.injector.get(MdButtonToggleGroup);

        buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(MdButtonToggle));
        buttonToggleNativeElements =
            buttonToggleDebugElements.map(debugEl => debugEl.nativeElement);
        buttonToggleInstances = buttonToggleDebugElements.map(debugEl => debugEl.componentInstance);
      });
    }));

    it('should set individual button toggle names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.name).toBe(groupInstance.name);
      }
    });

    it('should disable click interactions when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      buttonToggleNativeElements[0].click();
      expect(buttonToggleInstances[0].checked).toBe(false);
    });

    it('should update the group value when one of the toggles changes', () => {
      expect(groupInstance.value).toBeFalsy();
      let nativeCheckboxLabel = buttonToggleDebugElements[0].query(By.css('label')).nativeElement;

      nativeCheckboxLabel.click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
    });

    it('should update the group and toggles when one of the button toggles is clicked', () => {
      expect(groupInstance.value).toBeFalsy();
      let nativeCheckboxLabel = buttonToggleDebugElements[0].query(By.css('label')).nativeElement;

      nativeCheckboxLabel.click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
      expect(buttonToggleInstances[0].checked).toBe(true);
      expect(buttonToggleInstances[1].checked).toBe(false);

      let nativeCheckboxLabel2 = buttonToggleDebugElements[1].query(By.css('label')).nativeElement;

      nativeCheckboxLabel2.click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test2');
      expect(groupInstance.selected).toBe(buttonToggleInstances[1]);
      expect(buttonToggleInstances[0].checked).toBe(false);
      expect(buttonToggleInstances[1].checked).toBe(true);
    });

    it('should check a button toggle upon interaction with underlying native radio button', () => {
      let nativeRadioInput = buttonToggleDebugElements[0].query(By.css('input')).nativeElement;

      nativeRadioInput.click();
      fixture.detectChanges();

      expect(buttonToggleInstances[0].checked).toBe(true);
      expect(groupInstance.value);
    });

    it('should emit a change event from button toggles', fakeAsync(() => {
      expect(buttonToggleInstances[0].checked).toBe(false);

      let changeSpy = jasmine.createSpy('button-toggle change listener');
      buttonToggleInstances[0].change.subscribe(changeSpy);

      buttonToggleInstances[0].checked = true;
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      buttonToggleInstances[0].checked = false;
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

    it('should emit a change event from the button toggle group', fakeAsync(() => {
      expect(groupInstance.value).toBeFalsy();

      let changeSpy = jasmine.createSpy('button-toggle-group change listener');
      groupInstance.change.subscribe(changeSpy);

      groupInstance.value = 'test1';
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      groupInstance.value = 'test2';
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

    it('should update the group and button toggles when updating the group value', () => {
      expect(groupInstance.value).toBeFalsy();

      testComponent.groupValue = 'test1';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
      expect(buttonToggleInstances[0].checked).toBe(true);
      expect(buttonToggleInstances[1].checked).toBe(false);

      testComponent.groupValue = 'test2';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test2');
      expect(groupInstance.selected).toBe(buttonToggleInstances[1]);
      expect(buttonToggleInstances[0].checked).toBe(false);
      expect(buttonToggleInstances[1].checked).toBe(true);
    });

    it('should deselect all of the checkboxes when the group value is cleared', () => {
      buttonToggleInstances[0].checked = true;

      expect(groupInstance.value).toBeTruthy();

      groupInstance.value = null;

      expect(buttonToggleInstances.every(toggle => !toggle.checked)).toBe(true);
    });
  });

  describe('button toggle group with ngModel', () => {
    let fixture: ComponentFixture<ButtonToggleGroupWithNgModel>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let buttonToggleDebugElements: DebugElement[];
    let buttonToggleNativeElements: HTMLElement[];
    let groupInstance: MdButtonToggleGroup;
    let buttonToggleInstances: MdButtonToggle[];
    let testComponent: ButtonToggleGroupWithNgModel;
    let groupNgControl: NgControl;

    beforeEach(async(() => {
      builder.createAsync(ButtonToggleGroupWithNgModel).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        groupDebugElement = fixture.debugElement.query(By.directive(MdButtonToggleGroup));
        groupNativeElement = groupDebugElement.nativeElement;
        groupInstance = groupDebugElement.injector.get(MdButtonToggleGroup);
        groupNgControl = groupDebugElement.injector.get(NgControl);

        buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(MdButtonToggle));
        buttonToggleNativeElements =
            buttonToggleDebugElements.map(debugEl => debugEl.nativeElement);
        buttonToggleInstances = buttonToggleDebugElements.map(debugEl => debugEl.componentInstance);
      });
    }));

    it('should set individual radio names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.name).toBe(groupInstance.name);
      }

      groupInstance.name = 'new name';
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.name).toBe(groupInstance.name);
      }
    });

    it('should check the corresponding button toggle on a group value change', () => {
      expect(groupInstance.value).toBeFalsy();
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.checked).toBeFalsy();
      }

      groupInstance.value = 'red';
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.checked).toBe(groupInstance.value === buttonToggle.value);
      }
      expect(groupInstance.selected.value).toBe(groupInstance.value);
    });

    it('should have the correct ngControl state initially and after interaction', fakeAsync(() => {
      expect(groupNgControl.valid).toBe(true);
      expect(groupNgControl.pristine).toBe(true);
      expect(groupNgControl.touched).toBe(false);

      buttonToggleInstances[1].checked = true;
      fixture.detectChanges();
      tick();

      expect(groupNgControl.valid).toBe(true);
      expect(groupNgControl.pristine).toBe(false);
      expect(groupNgControl.touched).toBe(false);

      let nativeRadioLabel = buttonToggleDebugElements[2].query(By.css('label')).nativeElement;
      nativeRadioLabel.click();
      fixture.detectChanges();
      tick();

      expect(groupNgControl.valid).toBe(true);
      expect(groupNgControl.pristine).toBe(false);
      expect(groupNgControl.touched).toBe(true);
    }));

    it('should update the ngModel value when selecting a button toggle', fakeAsync(() => {
      buttonToggleInstances[1].checked = true;
      fixture.detectChanges();

      tick();

      expect(testComponent.modelValue).toBe('green');
    }));
  });

  describe('button toggle group with ngModel and change event', () => {
    let fixture: ComponentFixture<ButtonToggleGroupWithNgModel>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let buttonToggleDebugElements: DebugElement[];
    let buttonToggleNativeElements: HTMLElement[];
    let groupInstance: MdButtonToggleGroup;
    let buttonToggleInstances: MdButtonToggle[];
    let testComponent: ButtonToggleGroupWithNgModel;
    let groupNgControl: NgControl;

    beforeEach(async(() => {
      builder.createAsync(ButtonToggleGroupWithNgModel).then(f => {
        fixture = f;

        testComponent = fixture.debugElement.componentInstance;

        groupDebugElement = fixture.debugElement.query(By.directive(MdButtonToggleGroup));
        groupNativeElement = groupDebugElement.nativeElement;
        groupInstance = groupDebugElement.injector.get(MdButtonToggleGroup);
        groupNgControl = groupDebugElement.injector.get(NgControl);

        buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(MdButtonToggle));
        buttonToggleNativeElements =
            buttonToggleDebugElements.map(debugEl => debugEl.nativeElement);
        buttonToggleInstances = buttonToggleDebugElements.map(debugEl => debugEl.componentInstance);

        fixture.detectChanges();
      });
    }));

    it('should update the model before firing change event', fakeAsync(() => {
      expect(testComponent.modelValue).toBeUndefined();
      expect(testComponent.lastEvent).toBeUndefined();

      groupInstance.value = 'red';
      fixture.detectChanges();

      tick();
      expect(testComponent.modelValue).toBe('red');
      expect(testComponent.lastEvent.value).toBe('red');
    }));
  });

  describe('inside of a multiple selection group', () => {
    let fixture: ComponentFixture<ButtonTogglesInsideButtonToggleGroupMultiple>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let buttonToggleDebugElements: DebugElement[];
    let buttonToggleNativeElements: HTMLElement[];
    let groupInstance: MdButtonToggleGroupMultiple;
    let buttonToggleInstances: MdButtonToggle[];
    let testComponent: ButtonTogglesInsideButtonToggleGroupMultiple;

    beforeEach(async(() => {
      builder.createAsync(ButtonTogglesInsideButtonToggleGroupMultiple).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        groupDebugElement = fixture.debugElement.query(By.directive(MdButtonToggleGroupMultiple));
        groupNativeElement = groupDebugElement.nativeElement;
        groupInstance = groupDebugElement.injector.get(MdButtonToggleGroupMultiple);

        buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(MdButtonToggle));
        buttonToggleNativeElements =
            buttonToggleDebugElements.map(debugEl => debugEl.nativeElement);
        buttonToggleInstances = buttonToggleDebugElements.map(debugEl => debugEl.componentInstance);
      });
    }));

    it('should disable click interactions when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      buttonToggleNativeElements[0].click();
      expect(buttonToggleInstances[0].checked).toBe(false);
    });

    it('should check a button toggle when clicked', () => {
      expect(buttonToggleInstances.every(buttonToggle => !buttonToggle.checked)).toBe(true);

      let nativeCheckboxLabel = buttonToggleDebugElements[0].query(By.css('label')).nativeElement;

      nativeCheckboxLabel.click();
      expect(buttonToggleInstances[0].checked).toBe(true);
    });

    it('should allow for multiple toggles to be selected', () => {
      buttonToggleInstances[0].checked = true;
      fixture.detectChanges();
      expect(buttonToggleInstances[0].checked).toBe(true);

      buttonToggleInstances[1].checked = true;
      fixture.detectChanges();
      expect(buttonToggleInstances[1].checked).toBe(true);
      expect(buttonToggleInstances[0].checked).toBe(true);
    });

    it('should check a button toggle upon interaction with underlying native checkbox', () => {
      let nativeCheckboxInput = buttonToggleDebugElements[0].query(By.css('input')).nativeElement;

      nativeCheckboxInput.click();
      fixture.detectChanges();

      expect(buttonToggleInstances[0].checked).toBe(true);
    });

    it('should deselect a button toggle when selected twice', () => {
      buttonToggleNativeElements[0].click();
      fixture.detectChanges();

      buttonToggleNativeElements[0].click();
      fixture.detectChanges();

      expect(buttonToggleInstances[0].checked).toBe(false);
    });
  });

  describe('as standalone', () => {
    let fixture: ComponentFixture<StandaloneButtonToggle>;
    let buttonToggleDebugElement: DebugElement;
    let buttonToggleNativeElement: HTMLElement;
    let buttonToggleInstance: MdButtonToggle;
    let testComponent: StandaloneButtonToggle;

    beforeEach(async(() => {
      builder.createAsync(StandaloneButtonToggle).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        buttonToggleDebugElement = fixture.debugElement.query(By.directive(MdButtonToggle));
        buttonToggleNativeElement = buttonToggleDebugElement.nativeElement;
        buttonToggleInstance = buttonToggleDebugElement.componentInstance;
      });
    }));

    it('should toggle when clicked', () => {
      let nativeCheckboxLabel = buttonToggleDebugElement.query(By.css('label')).nativeElement;

      nativeCheckboxLabel.click();

      fixture.detectChanges();

      expect(buttonToggleInstance.checked).toBe(true);

      nativeCheckboxLabel.click();
      fixture.detectChanges();

      expect(buttonToggleInstance.checked).toBe(false);
    });
  });
});


@Component({
  directives: [MD_BUTTON_TOGGLE_DIRECTIVES],
  template: `
  <md-button-toggle-group [disabled]="isGroupDisabled" [value]="groupValue">
    <md-button-toggle value="test1">Test1</md-button-toggle>
    <md-button-toggle value="test2">Test2</md-button-toggle>
    <md-button-toggle value="test3">Test3</md-button-toggle>
  </md-button-toggle-group>
  `
})
class ButtonTogglesInsideButtonToggleGroup {
  isGroupDisabled: boolean = false;
  groupValue: string = null;
}

@Component({
  directives: [MD_BUTTON_TOGGLE_DIRECTIVES],
  template: `
  <md-button-toggle-group [(ngModel)]="modelValue" (change)="lastEvent = $event">
    <md-button-toggle *ngFor="let option of options" [value]="option.value">
      {{option.label}}
    </md-button-toggle>
  </md-button-toggle-group>
  `
})
class ButtonToggleGroupWithNgModel {
  modelValue: string;
  options = [
    {label: 'Red', value: 'red'},
    {label: 'Green', value: 'green'},
    {label: 'Blue', value: 'blue'},
  ];
  lastEvent: MdButtonToggleChange;
}

@Component({
  directives: [MD_BUTTON_TOGGLE_DIRECTIVES],
  template: `
  <md-button-toggle-group [disabled]="isGroupDisabled" multiple>
    <md-button-toggle value="eggs">Eggs</md-button-toggle>
    <md-button-toggle value="flour">Flour</md-button-toggle>
    <md-button-toggle value="sugar">Sugar</md-button-toggle>
  </md-button-toggle-group>
  `
})
class ButtonTogglesInsideButtonToggleGroupMultiple {
  isGroupDisabled: boolean = false;
}

@Component({
  directives: [MD_BUTTON_TOGGLE_DIRECTIVES],
  template: `
  <md-button-toggle>Yes</md-button-toggle>
  `
})
class StandaloneButtonToggle { }
