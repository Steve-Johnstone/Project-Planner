class DOMHelper {
  static clearEventListeners(element) {
    const clonedElement = element.cloneNode(true);
    element.replaceWith(clonedElement);
    return clonedElement;
  }

  static moveElement(elementId, newDestinationSelector) {
    const element = document.getElementById(elementId);
    const destinationElement = document.querySelector(newDestinationSelector);
    destinationElement.append(element);
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

class Helper {
  constructor(hostElementId, insertBefore = false) {
    if (hostElementId) {
      this.hostElement = document.getElementById(hostElementId);
    } else {
      this.hostElement = document.body;
    }
    this.insertBefore = insertBefore;
  }
  detach() {
    this.element.remove();
  }

  attach(elementType, className, eventListenerFunction, data) {
    const element = document.createElement(elementType);
    element.className = className;
    const tooltipTemplate = document.getElementById('tooltip');
    const tooltipBody = document.importNode(tooltipTemplate.content, true);
    tooltipBody.querySelector('p').textContent = data;
    element.append(tooltipBody);

    const hostElPosLeft = this.hostElement.offsetLeft;
    const hostElPosTop = this.hostElement.offsetTop;
    const hostElHeight = this.hostElement.clientHeight;
    const parentElementScrolling = this.hostElement.parentElement.scrollTop;

    const x = hostElPosLeft + 20;
    const y = hostElPosTop + hostElHeight - parentElementScrolling - 10;

    element.style.position = 'absolute';
    element.style.left = x + 'px';
    element.style.top = y + 'px';

    element.addEventListener('click', eventListenerFunction);
    this.element = element;
    this.hostElement.insertAdjacentElement(
      this.insertBefore ? 'afterbeing' : 'beforeend',
      this.element
    );
  }
}
class Tooltip extends Helper {
  constructor(hostElementId, tooltipRemoved) {
    super(hostElementId);
    this.tooltipRemoved = tooltipRemoved;
    this.eventListenerFunction = this.closeTooltip;
  }
  closeTooltip = () => {
    this.detach();
    this.tooltipRemoved();
  };
}

class ProjectItem {
  constructor(id, updateProjectList, type) {
    this.id = id;
    this.hasTooltip = false;
    this.tooltipRemoved;
    this.updateProjectList = updateProjectList;
    this.connectFinishButton(type);
    this.connectInfoButton();
  }
  connectFinishButton(type) {
    const projectItemElement = document.getElementById(this.id);
    let finishBtn = projectItemElement.querySelector('button:last-of-type');
    finishBtn = DOMHelper.clearEventListeners(finishBtn);
    finishBtn.textContent = type == 'active' ? 'Finish' : 'Activate';
    finishBtn.addEventListener(
      'click',
      this.updateProjectList.bind(null, this.id)
    );
  }

  showTooltip() {
    if (this.hasTooltip) {
      return;
    }
    const projectElement = document.getElementById(this.id);
    const data = projectElement.dataset.extraInfo;
    const tooltip = new Tooltip(this.id, () => {
      this.hasTooltip = false;
    });
    tooltip.attach('div', 'card', tooltip.eventListenerFunction, data);
    this.hasTooltip = true;
  }

  connectInfoButton() {
    const projectItemElement = document.getElementById(this.id);
    let infoBtn = projectItemElement.querySelector('button:first-of-type');
    infoBtn.addEventListener('click', this.showTooltip.bind(this));
  }

  update(updateProjectListFn, type) {
    this.updateProjectList = updateProjectListFn;
    this.connectFinishButton(type);
  }
}

class ProjectList {
  projects = [];

  constructor(type) {
    this.type = type;
    const projectItems = document.querySelectorAll(`#${type}-projects li`);
    for (const item of projectItems) {
      this.projects.push(
        new ProjectItem(item.id, this.switchProject.bind(this), this.type)
      );
    }
  }

  switchHandler(switchHandler) {
    this.switchHandler = switchHandler;
  }

  addProject(project) {
    this.projects.push(project);
    DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
    project.update(this.switchProject.bind(this), this.type);
  }

  switchProject(projectId) {
    this.switchHandler(this.projects.find((p) => p.id == projectId));
    this.projects = this.projects.filter((p) => p.id !== projectId);
  }
}

class App {
  static init() {
    const activeList = new ProjectList('active');
    const finishedList = new ProjectList('finished');
    activeList.switchHandler(finishedList.addProject.bind(finishedList));
    finishedList.switchHandler(activeList.addProject.bind(activeList));
  }
}

App.init();
