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
  }
}

class Tooltip {
  constructor(tooltipRemoved) {
    this.tooltipRemoved = tooltipRemoved;
  }
  closeTooltip = () => {
    this.detach();
    this.tooltipRemoved();
  };

  detach() {
    this.element.remove();
  }

  attach() {
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'card';
    tooltipElement.innerText = 'This is your additional info mofo!';
    tooltipElement.addEventListener('click', this.closeTooltip);
    this.element = tooltipElement;
    document.body.append(tooltipElement);
  }
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
    const tooltip = new Tooltip(() => (this.hasTooltip = false));
    tooltip.attach();
    this.hasTooltip = true;
  }

  connectInfoButton() {
    const projectItemElement = document.getElementById(this.id);
    let infoBtn = projectItemElement.querySelector('button:first-of-type');
    infoBtn.addEventListener('click', this.showTooltip);
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
