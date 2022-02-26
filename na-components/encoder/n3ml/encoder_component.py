import sys, os
sys.path.append(os.getcwd() + "\\na-components\encoder")
MNIST_DOWNLOAD_DIR = os.getcwd() + "\\na-components\encoder\\test\\data"
try:
    import numpy as np
    import torch
    import torchvision
    import torchvision.transforms as transforms
    import matplotlib.pyplot as plt

    import n3ml.model
    import n3ml.data
    import n3ml.encoder
    import n3ml.optimizer

    class NullWriter (object):
        def write (self, arg):
            pass
        def flush(args):
            pass
    nullwrite = NullWriter()
    oldstdout = sys.stdout
    sys.stdout = nullwrite

    # sys.stdout = oldstdout
    # print("callpython start")
    # sys.stdout.flush()

    arg = sys.argv
    encoder_type = arg[1]
    simple_time_interval = int(arg[2])
    simplePoisson_time_interval = int(arg[3])
    poisson_time_interval = int(arg[4])

    population1_neurons = int(arg[5])
    population1_max_firing_time = int(arg[6])
    population1_not_to_fire = int(arg[7])
    population1_dt = int(arg[8])

    loadDataset = False
    
    if len(arg) > 9:
        loadDataset = True
        select_number = int(arg[9])
        dataStr = arg[10]
        
        parse = dataStr.replace("\r", "")
        parse = parse.replace("\n", "")
        parse = parse.replace("[", "")
        parse = parse.replace("]", "")
        parse = parse.replace("0.", "#0.")
        parse = parse.replace("1.", "#1.")
        parse = parse.replace(" ", "")
        parse_list = parse.split("#")
        x_data = []
        y_data = []
        for i in range(1, len(parse_list)):
            sd = parse_list[i]
            fd = float(sd)
            x_data.append(fd)
        x_data = np.array(x_data)
        x_data = np.reshape(x_data, (1, 28, 28))
        x_data = torch.Tensor(x_data)
        y_data = torch.Tensor([select_number])

    def simple():
        global loadDataset
        # sys.stdout = oldstdout
        # print("simple start")
        # sys.stdout.flush()
        encoder = n3ml.encoder.Simple(time_interval=simple_time_interval) #time_interval : 100
        if not loadDataset:
            data=MNIST_DOWNLOAD_DIR
            loader = torch.utils.data.DataLoader(
            torchvision.datasets.MNIST(
                #opt.data,
                data,
                train=False,
                transform=torchvision.transforms.Compose([transforms.ToTensor()])),
            #batch_size=opt.batch_size,
            batch_size=1,
            shuffle=True)
            for image, label in loader:
            # Squeeze batch dimension
            # Now, batch processing isn't supported
                image = image.squeeze(dim=0)
                label = label.squeeze()
                spiked_image = encoder(image)
        else:
            label = y_data.squeeze()
            spiked_image = encoder(x_data)

        #return spiked_image
        # sys.stdout = oldstdout
        # print("simple complete")
        # sys.stdout.flush()

        sys.stdout = oldstdout
        npArr = spiked_image.numpy()
        npArr = np.reshape(npArr, (-1, 28*28))
        parse = str(int(label.numpy())) + "|"
        for dim in npArr:
            for d in dim:
                parse += str(d) + ','
            parse += "|"
        print(parse.replace(',|', '|'), end='')
        #print(spiked_image)
        sys.stdout.flush()

    def simplepoisson():
        time_interval = simplePoisson_time_interval
        return None


    def poisson():
        # sys.stdout = oldstdout
        # print("poisson start")
        # sys.stdout.flush()

        encoder = n3ml.encoder.PoissonEncoder(poisson_time_interval) #time_interval : 
        #num_epochs = 3 #opt.num_epochs
        #batch_size = #opt.batch_size
        model = n3ml.model.DiehlAndCook2015Infer(neurons=400)

        loader = torch.utils.data.DataLoader(
                torchvision.datasets.MNIST(
                    "data",
                    train=True,
                    transform=torchvision.transforms.Compose([
                        torchvision.transforms.ToTensor(), torchvision.transforms.Lambda(lambda x: x * 32 * 4)])),
                batch_size=1,
                shuffle=True)

        for step, (images, label) in enumerate(loader):
                #model.init_param()
                images = images.view(1, 28, 28)

                spiked_images = encoder(images)
                spiked_images = spiked_images.view(250, -1) # time_interval, -1
                spiked_images = spiked_images.cuda()

        # sys.stdout = oldstdout
        # print("poisson complete")
        # sys.stdout.flush()

        sys.stdout = oldstdout
        print(spiked_images)
        sys.stdout.flush()

    def population1():

        # sys.stdout = oldstdout
        # print("population1 start")
        # sys.stdout.flush()


        data_loader = n3ml.data.IRISDataLoader(ratio=0.8)
        data = data_loader.run()
        summary = data_loader.summarize()
        encoder = n3ml.encoder.Population(neurons=population1_neurons, #12
                                                minimum=summary['min'],
                                                maximum=summary['max'],
                                                max_firing_time=population1_max_firing_time, #30
                                                not_to_fire=population1_not_to_fire, #28
                                                dt=population1_dt) # 1
        for i in range(data['test.data'].size(0)):
                #model.initialize(delay=False)
                input = data['test.data'][i]
                label = data['test.target'][i]

                #print("data shape : ", input.shape)
                #print("data : ", input)
                spiked_input = encoder.run(input)
                sys.stdout = oldstdout      
                print(spiked_input)
                sys.stdout.flush()


        # sys.stdout = oldstdout      
        # print("population1 complete")
        # #print(spiked_input)
        # sys.stdout.flush()

    def population2():

        return None

    # sys.stdout = oldstdout
    # print("python start")
    # sys.stdout.flush()

    # sys.stdout = oldstdout
    # print("encoder_type : ", encoder_type)
    # sys.stdout.flush()


    # sys.stdout = oldstdout
    # print("simple_time_interval : ", simple_time_interval)
    # sys.stdout.flush()



    if encoder_type=="1":
        # sys.stdout = oldstdout
        # print("simple Encoding start")
        # sys.stdout.flush()
        simple()
    elif encoder_type=="2":
        # print("simplePoisson Encoding start")
        simplepoisson()
    elif encoder_type=="3":
        # print("poisson Encoding start")
        poisson()
    elif encoder_type=="4":
        # print("population1 Encoding start")
        population1()
    elif encoder_type=="5":
        # print("population2 Encoding start")
        population2()
except Exception as e:
    print(e)

